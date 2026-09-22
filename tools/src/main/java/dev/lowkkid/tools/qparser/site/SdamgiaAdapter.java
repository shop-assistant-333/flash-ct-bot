package dev.lowkkid.tools.qparser.site;

import dev.lowkkid.tools.qparser.config.TestConfig;
import dev.lowkkid.tools.qparser.model.HarvestedOption;
import dev.lowkkid.tools.qparser.model.HarvestedQuestion;
import dev.lowkkid.tools.qparser.model.QuestionType;
import dev.lowkkid.tools.qparser.net.FormSession;
import dev.lowkkid.tools.qparser.util.Text;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.ArrayList;
import java.util.List;

/**
 * «РЕШУ ЦТ/ЦЭ» (*.sdamgia.ru). The whole test is one page, like saharina — but the form is
 * never submitted: every problem links to its own page, and that page carries the right answer
 * in a hidden {@code .answer} block. So the walk is one request for the test plus one per
 * problem, and nothing depends on guessing what the checker would say.
 *
 * <p>The answer comes as the option numbers the student should tick ({@code Ответ: 235}) or,
 * for a question with a text field, as the word itself ({@code Ответ: совьют}).
 *
 * <p>Explanations are deliberately left out. The site writes them with nested markup, soft
 * hyphens and letter-spacing tricks that do not survive being flattened to the plain text our
 * UI renders.
 */
public final class SdamgiaAdapter implements SiteAdapter {

    /** The site numbers options itself, and authors often number them again inside the text. */
    private static final String OPTION_NUMBER = "^\\s*\\d+\\s*[).]\\s*";

    @Override
    public String id() {
        return "sdamgia";
    }

    @Override
    public List<HarvestedQuestion> harvest(FormSession session,
                                           TestConfig config,
                                           HarvestIndex known,
                                           Progress progress) throws Exception {
        Document page = session.get(reachable(config.getUrl()));
        Elements problems = page.select("div.prob_maindiv[data-id]");
        if (problems.isEmpty()) {
            throw new IllegalStateException("No problems on " + config.getUrl()
                    + " — the test is empty, or the page is not a test.");
        }
        progress.info("The test has " + problems.size() + " problem(s) on one page.");

        List<HarvestedQuestion> collected = new ArrayList<>();
        int limit = config.limitOrAll();
        for (Element problem : problems) {
            if (collected.size() >= limit) {
                break;
            }
            HarvestedQuestion question = collect(session, page, problem, known, progress);
            if (question == null) {
                continue;
            }
            collected.add(question);
            known.record(question);
            int total = limit == Integer.MAX_VALUE ? problems.size() : limit;
            progress.info(collected.size() + "/" + total + "  " + question.getType()
                    + "  [" + topic(problem) + "]  " + preview(question.getTitle()));
        }
        return collected;
    }

    private HarvestedQuestion collect(FormSession session,
                                      Document page,
                                      Element problem,
                                      HarvestIndex known,
                                      Progress progress) throws Exception {
        Element link = problem.selectFirst(".prob_nums a[href*=problem?id=]");
        if (link == null) {
            progress.warn("Skipping a problem with no link of its own — without it there is "
                    + "nowhere to read its answer from.");
            return null;
        }
        String problemUrl = link.absUrl("href");
        String sourceId = "problem?id=" + link.text().trim();
        if (known.knowsSourceId(sourceId)) {
            return null;
        }

        String title = Text.plain(problem.selectFirst(".pbody"));
        if (title == null) {
            progress.warn("Skipping " + sourceId + " — it has no text.");
            return null;
        }
        if (known.knowsTitle(title)) {
            progress.warn("Skipping " + sourceId + " — the test already asked \""
                    + preview(title) + "\".");
            return null;
        }
        if (!problem.select("img").isEmpty()) {
            progress.warn(sourceId + " has an image, which the database cannot store — the "
                    + "text alone may not make sense.");
        }

        HarvestedQuestion question = new HarvestedQuestion();
        question.setSourceId(sourceId);
        question.setTitle(title);

        // The answer widgets live outside .prob_maindiv, next to it. Their names are built from
        // the problem's position and id, which is a surer way to find them than walking the DOM.
        String field = "answer_" + problem.attr("data-num") + "_" + problem.attr("data-id");
        Elements choices = page.select("input[type=checkbox][name=" + field + "]");
        Elements text = page.select("input[type=text][name=" + field + "]");
        if (choices.isEmpty() && text.isEmpty()) {
            progress.warn("Skipping " + sourceId + " — its answer widget is neither a set of "
                    + "checkboxes nor a text field.");
            return null;
        }

        String answer = answerOf(session, problemUrl);
        if (answer == null) {
            progress.warn("Skipping " + sourceId + " — its page does not spell out the answer.");
            return null;
        }

        if (!choices.isEmpty()) {
            question.setType(QuestionType.MULTI_ANSWER);
            if (!fillOptions(question, choices, answer, sourceId, progress)) {
                return null;
            }
            return question;
        }
        question.setType(QuestionType.INPUT);
        question.setCorrectAnswer(answer);
        return question;
    }

    /**
     * Ticks the options the answer names. It is written as the numbers on the page — "235"
     * means the second, third and fifth — so an option the author hid still counts when the
     * numbering is worked out.
     */
    private boolean fillOptions(HarvestedQuestion question,
                                Elements choices,
                                String answer,
                                String sourceId,
                                Progress progress) {
        if (!answer.matches("\\d+")) {
            progress.warn("Skipping " + sourceId + " — its answer \"" + answer + "\" is not a "
                    + "list of option numbers, so there is nothing to tick.");
            return false;
        }
        List<HarvestedOption> byNumber = new ArrayList<>();
        for (Element choice : choices) {
            Element label = choice.closest("label");
            String option = optionText(label);
            // The site pads every question out to eight options and hides the unused ones.
            if (option == null || hidden(label)) {
                byNumber.add(null);
                continue;
            }
            HarvestedOption harvested = new HarvestedOption(option, false);
            byNumber.add(harvested);
            question.getOptions().add(harvested);
        }
        for (char number : answer.toCharArray()) {
            int index = number - '1';
            if (index < 0 || index >= byNumber.size() || byNumber.get(index) == null) {
                progress.warn("Skipping " + sourceId + " — its answer points at option "
                        + number + ", which the page does not offer.");
                return false;
            }
            byNumber.get(index).setCorrect(true);
        }
        return true;
    }

    /** Reads the answer off a problem's own page. */
    private String answerOf(FormSession session, String problemUrl) throws Exception {
        Element answer = session.get(problemUrl).selectFirst("div.answer");
        if (answer == null) {
            return null;
        }
        String text = Text.oneLine(answer);
        if (text == null) {
            return null;
        }
        String spelled = text.replaceFirst("(?iu)^\\s*ответ\\s*:?\\s*", "").trim();
        return spelled.isEmpty() ? null : spelled;
    }

    private static String optionText(Element label) {
        if (label == null) {
            return null;
        }
        Element withoutInput = label.clone();
        withoutInput.select("input").remove();
        String text = Text.oneLine(withoutInput);
        if (text == null) {
            return null;
        }
        // Once for the site's own numbering, once for the author's copy of it.
        return text.replaceFirst(OPTION_NUMBER, "").replaceFirst(OPTION_NUMBER, "").trim();
    }

    private static boolean hidden(Element label) {
        return label.attr("style").replace(" ", "").contains("display:none");
    }

    /** What the site says the problem is about — shown so a stray topic is noticed early. */
    private static String topic(Element problem) {
        Elements lines = problem.select(".align-left > div");
        if (lines.isEmpty()) {
            return "no topic";
        }
        String last = Text.oneLine(lines.last());
        return last == null ? "no topic" : last;
    }

    /**
     * The site names its subject subdomains with an underscore — {@code rus_ct.sdamgia.ru} —
     * and Java's HTTP client rejects such a URL outright, because an underscore is not legal in
     * a host name. The same server answers to the hyphen spelling, so that is what we ask for;
     * the harvest still records the URL the config was written with.
     */
    private static String reachable(String url) {
        int scheme = url.indexOf("://");
        if (scheme < 0) {
            return url;
        }
        int hostEnd = url.indexOf('/', scheme + 3);
        String host = hostEnd < 0 ? url.substring(scheme + 3) : url.substring(scheme + 3, hostEnd);
        if (!host.contains("_")) {
            return url;
        }
        return url.substring(0, scheme + 3) + host.replace('_', '-')
                + (hostEnd < 0 ? "" : url.substring(hostEnd));
    }

    private static String preview(String title) {
        String flat = title.replaceAll("\\s+", " ").trim();
        return flat.length() <= 60 ? flat : flat.substring(0, 57) + "...";
    }
}
