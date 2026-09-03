package dev.lowkkid.tools.qparser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import dev.lowkkid.tools.qparser.config.TestConfig;
import dev.lowkkid.tools.qparser.model.Harvest;
import dev.lowkkid.tools.qparser.model.HarvestedQuestion;
import dev.lowkkid.tools.qparser.net.FormSession;
import dev.lowkkid.tools.qparser.site.Adapters;
import dev.lowkkid.tools.qparser.site.HarvestIndex;
import dev.lowkkid.tools.qparser.site.Progress;
import dev.lowkkid.tools.qparser.site.SiteAdapter;
import dev.lowkkid.tools.qparser.sql.SqlGenerator;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Two commands, kept apart on purpose: {@code harvest} talks to the source site and writes a
 * JSON file you can read and fix by hand; {@code sql} turns that reviewed JSON into inserts.
 */
public final class Main {

    private static final ObjectMapper JSON = new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            usage();
            System.exit(2);
        }
        switch (args[0]) {
            case "harvest" -> harvest(args);
            case "sql" -> sql(args);
            default -> {
                usage();
                System.exit(2);
            }
        }
    }

    private static void harvest(String[] args) throws Exception {
        Path configPath = Path.of(required(args, "--config"));
        boolean dryRun = has(args, "--dry-run");
        boolean fresh = has(args, "--fresh");

        TestConfig config = TestConfig.load(configPath);
        if (dryRun) {
            config.setLimit(Math.min(3, config.limitOrAll()));
        }
        SiteAdapter adapter = Adapters.byId(config.getAdapter());
        Path out = configPath.toAbsolutePath().getParent().resolve(config.getOut());

        Harvest previous = (!fresh && Files.exists(out))
                ? JSON.readValue(Files.readString(out), Harvest.class)
                : null;
        HarvestIndex known = new HarvestIndex(
                previous == null ? List.of() : previous.getQuestions(), config.isDedupeByTitle());
        if (known.knownCount() > 0) {
            System.err.println(known.knownCount() + " question(s) already in " + out
                    + " — they will be walked past, not collected again.");
        }

        System.err.println("Harvesting " + config.getUrl());
        List<HarvestedQuestion> questions;
        try (FormSession session = new FormSession(config.getDelayMs())) {
            questions = adapter.harvest(session, config, known, Progress.stderr());
        }

        if (dryRun) {
            System.err.println("\n--dry-run: nothing written. What was parsed:\n");
            System.out.println(JSON.writeValueAsString(questions));
            return;
        }

        Harvest harvest = new Harvest();
        harvest.setSource(config.getUrl());
        harvest.setAdapter(adapter.id());
        harvest.setHarvestedAt(Instant.now().toString());
        harvest.setLessonId(config.getLessonId());
        harvest.setSubjectId(config.getSubjectId());
        harvest.setStartOrder(config.getStartOrder());

        List<HarvestedQuestion> all = new ArrayList<>();
        if (previous != null) {
            all.addAll(previous.getQuestions());
        }
        all.addAll(questions);
        harvest.setQuestions(all);

        Files.writeString(out, JSON.writeValueAsString(harvest));
        System.err.println("\nCollected " + questions.size() + " new question(s); "
                + all.size() + " in total -> " + out);
        System.err.println("Read it over before generating SQL — test authors make typos too.");
    }

    private static void sql(String[] args) throws Exception {
        Path in = Path.of(required(args, "--in"));
        Path out = Path.of(required(args, "--out"));

        Harvest harvest = JSON.readValue(Files.readString(in), Harvest.class);
        SqlGenerator.validate(harvest);
        Files.writeString(out, SqlGenerator.generate(harvest));
        System.err.println("Wrote " + harvest.getQuestions().size() + " question(s) -> " + out);
    }

    private static String required(String[] args, String name) {
        for (int i = 0; i < args.length - 1; i++) {
            if (args[i].equals(name)) {
                return args[i + 1];
            }
        }
        throw new IllegalArgumentException("Missing " + name);
    }

    private static boolean has(String[] args, String name) {
        for (String arg : args) {
            if (arg.equals(name)) {
                return true;
            }
        }
        return false;
    }

    private static void usage() {
        System.err.println("""
                qparser — collects questions from online tests and turns them into SQL.

                  harvest --config <file.yaml> [--dry-run] [--fresh]
                      Walks the test and writes the JSON named by the config's 'out'.
                      --dry-run  prints the first few questions and writes nothing.
                      --fresh    ignores an existing JSON instead of adding to it.

                  sql --in <harvest.json> --out <file.sql>
                      Turns a reviewed harvest into INSERT statements.

                Known adapters: %s
                """.formatted(Adapters.known()));
    }
}
