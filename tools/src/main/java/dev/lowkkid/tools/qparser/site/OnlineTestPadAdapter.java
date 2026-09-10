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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * onlinetestpad.com. A test is a single form posted back to itself; the response to "Далее"
 * renders the next step server-side.
 *
 * <p>The site has two ways of revealing correct answers, chosen by whoever authored the test:
 * either right after each answer, on the same page, or only on the review page shown once the
 * test is finished. This adapter reads the per-question reveal when it is there and falls back
 * to the review page for whatever is still missing, so it does not need to be told which kind
 * of test it is looking at.
 */
public final class OnlineTestPadAdapter implements SiteAdapter {

    /** A value no test could reasonably accept, so the site tells us the right one instead. */
    private static final String WRONG_ON_PURPOSE = "zzqq";

    private static final String NEXT = "Далее";
    private static final String FINISH = "Завершить";

    @Override
    public String id() {
        return "onlinetestpad";
    }

    @Override
    public List<HarvestedQuestion> harvest(FormSession session,
                                           TestConfig config,
                                           HarvestIndex known,
                                           Progress progress) throws Exception {
        Document page = start(session, config, progress);

        List<HarvestedQuestion> collected = new ArrayList<>();
        Map<String, HarvestedQuestion> awaitingAnswer = new LinkedHashMap<>();
        Set<String> seenThisRun = new LinkedHashSet<>();

        int limit = config.limitOrAll();
        int maxSteps = limit == Integer.MAX_VALUE ? 5000 : limit * 4 + 50;

        for (int step = 0; collected.size() < limit && step < maxSteps; step++) {
            if (!isLiveQuestion(page)) {
                progress.info("Test ended after " + collected.size() + " collected question(s).");
                break;
            }
            Element block = questionBlock(page);
            String sourceId = sourceId(block);
            if (sourceId == null) {
                progress.warn("Question block without an id, stopping.");
                break;
            }
            if (!seenThisRun.add(sourceId)) {
                progress.warn("Question " + sourceId + " came round a second time — the test is "
                        + "not advancing, stopping the walk.");
                break;
            }

            Widget widget = widget(block);
            if (widget.type == null) {
                progress.warn("Skipping question " + sourceId + " (" + widget.reason + ").");
            }
            boolean wanted = widget.type != null && !known.knowsSourceId(sourceId);

            HarvestedQuestion question = wanted ? parse(block, widget, progress) : null;
            if (question != null && known.knowsTitle(question.getTitle())) {
                progress.warn("Skipping question " + sourceId + " — the test already asked \""
                        + preview(question.getTitle()) + "\" under another id.");
                question = null;
            }

            Map<String, String> fields = formFields(page);
            fields.putAll(widget.probeAnswer());
            fields.put("btnNext", NEXT);
            Document after = session.postForm(config.getUrl(), fields);

            Element reveal = revealFor(after, sourceId);
            if (reveal != null) {
                if (question != null) {
                    applyReveal(question, reveal, widget(reveal));
                }
                page = advance(session, config, after);
            } else {
                page = after;
            }

            if (question != null) {
                collected.add(question);
                known.record(question);
                if (!question.isComplete()) {
                    awaitingAnswer.put(sourceId, question);
                }
                progress.info(collected.size() + "/" + (limit == Integer.MAX_VALUE ? "?" : limit)
                        + "  " + question.getType() + "  " + preview(question.getTitle()));
            }
        }

        if (!awaitingAnswer.isEmpty()) {
            progress.info("Reading the review page for " + awaitingAnswer.size()
                    + " question(s) whose answer was not shown inline.");
            fillFromReviewPage(session, config, page, awaitingAnswer);
        }

        collected.removeIf(question -> {
            if (question.isComplete()) {
                return false;
            }
            progress.warn("Dropping question " + question.getSourceId()
                    + " — the site never revealed its correct answer.");
            return true;
        });
        return collected;
    }

    /** Opens the test and presses the first "Далее", which is what actually starts it. */
    private Document start(FormSession session, TestConfig config, Progress progress)
            throws Exception {
        Document landing = session.get(config.getUrl());
        Map<String, String> fields = formFields(landing);

        for (Element input : landing.select("#testform input[type=text], #testform textarea")) {
            String name = input.attr("name");
            if (name.isBlank() || name.startsWith("t_ans")) {
                continue;
            }
            String value = config.getPrefill().get(name);
            if (value == null) {
                progress.warn("The start page asks for '" + name + "' — add it under 'prefill:' "
                        + "in the config if the test refuses to start.");
                value = "";
            }
            fields.put(name, value);
        }

        fields.put("btnNext", NEXT);
        Document first = session.postForm(config.getUrl(), fields);
        if (questionBlock(first) == null) {
            throw new IllegalStateException("The test did not start. It probably requires fields "
                    + "before the first question — run with --dump to see the start page.");
        }
        return first;
    }

    /** Moves past a reveal page to the next question. */
    private Document advance(FormSession session, TestConfig config, Document revealPage)
            throws Exception {
        Map<String, String> fields = formFields(revealPage);
        fields.put("btnNext", NEXT);
        return session.postForm(config.getUrl(), fields);
    }

    /**
     * Presses "Завершить" and reads the review page, which lists every answered question with
     * its correct answer marked.
     */
    /**
     * Reads the review page, which lists every answered question with its correct answer
     * marked. Reaching it takes a "Завершить" only if the walk stopped before the last
     * question — walking a test to its end lands on that page by itself.
     */
    private void fillFromReviewPage(FormSession session,
                                    TestConfig config,
                                    Document page,
                                    Map<String, HarvestedQuestion> awaiting) throws Exception {
        Document review = page;
        if (page.selectFirst("#testform input[name=btnFinish]") != null) {
            Map<String, String> fields = formFields(page);
            fields.put("btnFinish", FINISH);
            review = session.postForm(config.getUrl(), fields);
        }
        for (Element block : review.select("div.otp-item-view-question")) {
            HarvestedQuestion question = awaiting.get(sourceId(block));
            if (question != null) {
                applyReveal(question, block, widget(block));
            }
        }
    }

    // --- parsing -------------------------------------------------------------------------

    private static Element questionBlock(Document page) {
        return page.selectFirst("div.otp-item-view-question");
    }

    /**
     * True while we are still inside the running test. The review page shown afterwards renders
     * question blocks too, but without the navigation buttons.
     */
    private static boolean isLiveQuestion(Document page) {
        return questionBlock(page) != null
                && page.selectFirst("#testform input[name=btnNext]") != null;
    }

    private static String sourceId(Element block) {
        String id = block.id();
        return id.startsWith("dq_") ? id.substring(3) : null;
    }

    /**
     * A reveal is the same question rendered again with the verdict attached. Anything else —
     * including the same question re-rendered because the site rejected our answer — is not.
     */
    private static Element revealFor(Document page, String sourceId) {
        Element block = questionBlock(page);
        if (block == null || !sourceId.equals(sourceId(block))) {
            return null;
        }
        boolean revealed = !block.select(".otp-item-rw-container, .rightanswers").isEmpty()
                || !block.select(".otp-item-ans-correct").isEmpty();
        return revealed ? block : null;
    }

    private HarvestedQuestion parse(Element block, Widget widget, Progress progress) {
        HarvestedQuestion question = new HarvestedQuestion();
        question.setSourceId(sourceId(block));
        question.setType(widget.type);
        question.setTitle(Text.plain(block.selectFirst(".qtext")));
        question.setExplanation(Text.plain(block.selectFirst(".otp-item-q-comment .v")));
        if (widget.type != QuestionType.INPUT) {
            for (Element option : widget.options) {
                question.getOptions().add(new HarvestedOption(optionText(option), false));
            }
        }
        if (!block.select(".qcontainer img").isEmpty()) {
            progress.warn("Question " + question.getSourceId() + " has an image, which the "
                    + "database cannot store — the text alone may not make sense.");
        }
        return question;
    }

    /** Reads the correct answer out of a reveal or review rendering of a question. */
    private void applyReveal(HarvestedQuestion question, Element reveal, Widget revealWidget) {
        if (question.getType() == QuestionType.INPUT) {
            Element correct = reveal.selectFirst(".rightanswers .correctans");
            if (correct != null) {
                question.setCorrectAnswer(Text.oneLine(correct));
            } else if (isVerdictCorrect(reveal)) {
                question.setCorrectAnswer(WRONG_ON_PURPOSE);
            }
            return;
        }

        // Options are re-ordered between renderings, so the reveal's own list is the source of
        // truth for both the texts and which one is marked.
        List<HarvestedOption> options = new ArrayList<>();
        boolean anyCorrect = false;
        for (Element option : revealWidget.options) {
            boolean correct = isMarkedCorrect(option);
            anyCorrect |= correct;
            options.add(new HarvestedOption(optionText(option), correct));
        }
        if (options.isEmpty()) {
            return;
        }
        if (!anyCorrect) {
            // Some renderings spell the right answers out instead of marking the options.
            Elements spelled = reveal.select(".rightanswers .correctans");
            for (HarvestedOption option : options) {
                for (Element element : spelled) {
                    if (option.getText() != null
                            && option.getText().equalsIgnoreCase(Text.oneLine(element))) {
                        option.setCorrect(true);
                        anyCorrect = true;
                    }
                }
            }
        }
        if (anyCorrect) {
            question.setOptions(options);
        }
    }

    private static boolean isVerdictCorrect(Element reveal) {
        return !reveal.select(".alert-success").isEmpty();
    }

    private static boolean isMarkedCorrect(Element optionInput) {
        Element label = optionInput.closest("label");
        Element scope = label != null ? label : optionInput.parent();
        return scope != null && !scope.select(".otp-item-ans-correct").isEmpty();
    }

    private static String optionText(Element optionInput) {
        Element label = optionInput.closest("label");
        Element text = label == null ? null : label.selectFirst("span");
        return text == null ? null : Text.oneLine(text);
    }

    private static String preview(String title) {
        if (title == null) {
            return "";
        }
        String flat = title.replaceAll("\\s+", " ").trim();
        return flat.length() <= 60 ? flat : flat.substring(0, 57) + "...";
    }

    /** Every hidden field of the test form; these carry the session from step to step. */
    private static Map<String, String> formFields(Document page) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (Element input : page.select("#testform input[type=hidden]")) {
            String name = input.attr("name");
            if (!name.isBlank()) {
                fields.put(name, input.attr("value"));
            }
        }
        return fields;
    }

    // --- answer widgets ------------------------------------------------------------------

    /**
     * What the question expects as an answer, and how to send a deliberately wrong one. Even a
     * question we cannot store needs an answer: the test refuses to move on without one, and
     * everything behind it would be lost with it.
     */
    private static final class Widget {

        private final QuestionType type;
        private final String reason;
        private final Elements options;
        private final Map<String, String> probe;

        private Widget(QuestionType type, String reason, Elements options,
                       Map<String, String> probe) {
            this.type = type;
            this.reason = reason;
            this.options = options == null ? new Elements() : options;
            this.probe = probe;
        }

        Map<String, String> probeAnswer() {
            return probe;
        }
    }

    private static Widget widget(Element block) {
        Elements radios = block.select("input[type=radio][name^=t_ansgr_]");
        if (!radios.isEmpty()) {
            return new Widget(QuestionType.SINGLE_ANSWER, null, radios, pickFirst(radios));
        }
        Elements checkboxes = block.select("input[type=checkbox][id^=t_ans_]");
        if (!checkboxes.isEmpty()) {
            return new Widget(QuestionType.MULTI_ANSWER, null, checkboxes, pickFirst(checkboxes));
        }
        Elements texts = block.select("input[type=text][name^=t_ans_]");
        if (texts.size() == 1) {
            return new Widget(QuestionType.INPUT, null, null,
                    Map.of(texts.first().attr("name"), WRONG_ON_PURPOSE));
        }
        if (texts.size() > 1) {
            return new Widget(null, "several input fields, but a question stores one answer",
                    null, fillAll(texts));
        }
        Elements selects = block.select("select[name^=t_ans_]");
        if (!selects.isEmpty()) {
            return new Widget(null, "matching or ordering, which the database cannot store",
                    null, pickAny(selects));
        }
        return new Widget(null, "answer format not supported by the database schema", null,
                Map.of());
    }

    /** Ticks the first option, which is enough to count as answered. */
    private static Map<String, String> pickFirst(Elements inputs) {
        Element first = inputs.first();
        String value = first.attr("value");
        // A checkbox without a value posts "on" in a browser; sending an empty string instead
        // leaves the question unanswered and the test stops advancing.
        return Map.of(first.attr("name"), value.isBlank() ? "on" : value);
    }

    private static Map<String, String> fillAll(Elements texts) {
        Map<String, String> answer = new LinkedHashMap<>();
        for (Element text : texts) {
            answer.put(text.attr("name"), WRONG_ON_PURPOSE);
        }
        return answer;
    }

    /** Any real choice per dropdown; "0" is the empty placeholder the site reads as unanswered. */
    private static Map<String, String> pickAny(Elements selects) {
        Map<String, String> answer = new LinkedHashMap<>();
        for (Element select : selects) {
            for (Element option : select.select("option")) {
                String value = option.attr("value");
                if (!value.isBlank() && !value.equals("0")) {
                    answer.put(select.attr("name"), value);
                    break;
                }
            }
        }
        return answer;
    }
}
