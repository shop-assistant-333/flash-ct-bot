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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * saharina.ru. Unlike onlinetestpad, the whole test is one page: every question is rendered at
 * once and a single POST returns the self-check page with the verdicts. So the walk is two
 * requests, and there is no per-question reveal to chase.
 *
 * <p>The self-check page names the right answer only for questions we got wrong, which is why
 * the probe answer matters: pick the first option everywhere, and the site spells out the
 * correct one for every question except the ones where the first option happened to be right —
 * and those are exactly the ones the verdict already identifies.
 */
public final class SaharinaAdapter implements SiteAdapter {

    /** Strips the "1) " the author numbers options with; the verdict text comes without it. */
    private static final String OPTION_NUMBER = "^\\s*\\d+\\s*[).]\\s*";

    @Override
    public String id() {
        return "saharina";
    }

    @Override
    public List<HarvestedQuestion> harvest(FormSession session,
                                           TestConfig config,
                                           HarvestIndex known,
                                           Progress progress) throws Exception {
        Document page = session.get(config.getUrl());
        Element form = page.selectFirst("form.js-interactive-test");
        if (form == null) {
            throw new IllegalStateException("No test form on " + config.getUrl()
                    + " — the page is probably not an interactive test.");
        }

        Elements tasks = form.select("div.task-container");
        if (tasks.isEmpty()) {
            throw new IllegalStateException("The test form on " + config.getUrl()
                    + " has no questions.");
        }
        progress.info("The test has " + tasks.size() + " question(s) on one page.");

        // Every question is answered, including the ones we cannot store: the site checks the
        // whole form at once, and an unanswered question would come back without a verdict.
        Map<String, String> fields = hiddenFields(form);
        List<Parsed> parsed = new ArrayList<>();
        for (Element task : tasks) {
            Parsed question = parse(task, config, known, progress);
            parsed.add(question);
            fields.putAll(question.probe);
        }

        Document checked = session.postForm(config.getUrl(), fields);
        // The last container on the self-check page holds the score, not a question.
        Elements results = checked.select("div.task-container:has(div.task)");
        if (results.size() != tasks.size()) {
            throw new IllegalStateException("Asked " + tasks.size() + " question(s) but the "
                    + "self-check page came back with " + results.size()
                    + " — the site changed its markup.");
        }

        List<HarvestedQuestion> collected = new ArrayList<>();
        int limit = config.limitOrAll();
        for (int i = 0; i < parsed.size() && collected.size() < limit; i++) {
            HarvestedQuestion question = parsed.get(i).question;
            if (question == null) {
                continue;
            }
            Element result = results.get(i);
            // The self-check page carries no question ids, so the two pages line up by position
            // only. Comparing the texts is what catches that going wrong.
            if (!sameQuestion(question.getTitle(), title(result))) {
                throw new IllegalStateException("Question " + question.getSourceId()
                        + " does not match the self-check page at the same position — "
                        + "cannot tell which verdict belongs to it.");
            }
            if (!applyVerdict(question, result)) {
                progress.warn("Dropping question " + question.getSourceId()
                        + " — the self-check page did not name its correct answer.");
                continue;
            }
            collected.add(question);
            known.record(question);
            int total = limit == Integer.MAX_VALUE ? tasks.size() : limit;
            progress.info(collected.size() + "/" + total + "  " + question.getType()
                    + "  " + preview(question.getTitle()));
        }
        return collected;
    }

    // --- parsing -------------------------------------------------------------------------

    /** A question as read off the test page, together with the answer we will send for it. */
    private record Parsed(HarvestedQuestion question, Map<String, String> probe) {
    }

    private Parsed parse(Element task, TestConfig config, HarvestIndex known, Progress progress) {
        Elements radios = task.select("input[type=radio]");
        if (radios.isEmpty()) {
            progress.warn("Skipping a question with no radio options — this adapter only "
                    + "handles single-choice questions, which is all the site publishes.");
            return new Parsed(null, Map.of());
        }

        // Answering the first option everywhere is what makes the site reveal the rest.
        Element probe = radios.first();
        Map<String, String> answer = Map.of(probe.attr("name"), probe.attr("value"));

        String sourceId = sourceId(config.getUrl(), probe.attr("name"));
        if (known.knowsSourceId(sourceId)) {
            return new Parsed(null, answer);
        }
        String title = title(task);
        if (known.knowsTitle(title)) {
            progress.warn("Skipping question " + sourceId + " — the test already asked \""
                    + preview(title) + "\".");
            return new Parsed(null, answer);
        }

        HarvestedQuestion question = new HarvestedQuestion();
        question.setSourceId(sourceId);
        question.setType(QuestionType.SINGLE_ANSWER);
        question.setTitle(title);
        for (Element radio : radios) {
            question.getOptions().add(new HarvestedOption(optionText(radio), false));
        }
        if (!task.select("img").isEmpty()) {
            progress.warn("Question " + sourceId + " has an image, which the database cannot "
                    + "store — the text alone may not make sense.");
        }
        return new Parsed(question, answer);
    }

    /**
     * Marks the option the self-check page points at. Returns false when it points at nothing
     * we recognise, which leaves the question unusable.
     */
    private boolean applyVerdict(HarvestedQuestion question, Element result) {
        Element spelled = result.selectFirst(".answers-true .answer");
        String correct = spelled != null
                ? Text.oneLine(spelled)
                // No correction shown means the answer we sent was the right one.
                : (isCorrect(result) ? probedOptionText(question) : null);
        if (correct == null) {
            return false;
        }
        boolean marked = false;
        for (HarvestedOption option : question.getOptions()) {
            if (same(option.getText(), correct)) {
                option.setCorrect(true);
                marked = true;
            }
        }
        return marked;
    }

    private static boolean isCorrect(Element result) {
        return result.selectFirst(".answer-user .tag.is-success") != null;
    }

    /** The option we answered with — the first one, by construction. */
    private static String probedOptionText(HarvestedQuestion question) {
        return question.getOptions().isEmpty() ? null : question.getOptions().get(0).getText();
    }

    private static String title(Element task) {
        Element quest = task.selectFirst("p.quest");
        if (quest == null) {
            return null;
        }
        Element withoutNumber = quest.clone();
        withoutNumber.select("span.num").remove();
        return Text.plain(withoutNumber);
    }

    private static String optionText(Element radio) {
        Element label = radio.closest("label");
        if (label == null) {
            return null;
        }
        Element withoutInput = label.clone();
        withoutInput.select("input").remove();
        String text = Text.oneLine(withoutInput);
        return text == null ? null : text.replaceAll(OPTION_NUMBER, "").trim();
    }

    /**
     * A question id has to survive a re-run, and the site gives none of its own — but the test
     * file and the question's form field together identify it just as well.
     */
    private static String sourceId(String url, String fieldName) {
        int name = url.indexOf("name=");
        String test = name < 0 ? url : url.substring(name + "name=".length());
        int ampersand = test.indexOf('&');
        return (ampersand < 0 ? test : test.substring(0, ampersand)) + "#" + fieldName;
    }

    private static boolean sameQuestion(String fromTest, String fromCheck) {
        return fromTest == null || fromCheck == null || same(fromTest, fromCheck);
    }

    private static boolean same(String left, String right) {
        return left != null && right != null
                && left.replaceAll("\\s+", " ").trim().equalsIgnoreCase(
                        right.replaceAll("\\s+", " ").trim());
    }

    private static Map<String, String> hiddenFields(Element form) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (Element input : form.select("input[type=hidden]")) {
            String name = input.attr("name");
            if (!name.isBlank()) {
                fields.put(name, input.attr("value"));
            }
        }
        return fields;
    }

    private static String preview(String title) {
        if (title == null) {
            return "";
        }
        String flat = title.replaceAll("\\s+", " ").trim();
        return flat.length() <= 60 ? flat : flat.substring(0, 57) + "...";
    }
}
