package dev.lowkkid.tools.qparser.site;

import dev.lowkkid.tools.qparser.config.TestConfig;
import dev.lowkkid.tools.qparser.model.HarvestedQuestion;
import dev.lowkkid.tools.qparser.net.FormSession;

import java.util.List;

/**
 * Knows how one site drives its tests. Adding a site means adding an implementation here and
 * registering it in {@link Adapters} — nothing downstream of the harvest changes, because every
 * adapter produces the same {@link HarvestedQuestion} shape.
 */
public interface SiteAdapter {

    /** Value used in a config's {@code adapter:} field. */
    String id();

    /**
     * Walks the test and returns what it collected.
     *
     * @param known what the harvest already has; anything it recognises is walked past rather
     *              than collected again
     */
    List<HarvestedQuestion> harvest(FormSession session,
                                    TestConfig config,
                                    HarvestIndex known,
                                    Progress progress) throws Exception;
}
