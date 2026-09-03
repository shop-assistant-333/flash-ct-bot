package dev.lowkkid.tools.qparser.site;

/** Where an adapter reports what it is doing, so a long walk is not a silent one. */
public interface Progress {

    void info(String message);

    void warn(String message);

    static Progress stderr() {
        return new Progress() {
            @Override
            public void info(String message) {
                System.err.println("  " + message);
            }

            @Override
            public void warn(String message) {
                System.err.println("  ! " + message);
            }
        };
    }
}
