package dev.lowkkid.tools.qparser.net;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * A cookie-carrying browser stand-in for sites that drive a test through a plain HTML form
 * posted back to itself. No JavaScript is needed: every site we harvest from renders the next
 * question server-side in the response to the previous POST.
 */
public final class FormSession implements AutoCloseable {

    private static final String USER_AGENT =
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
                    + "Chrome/120.0.0.0 Safari/537.36";

    private final HttpClient http;
    private final int delayMs;
    private String referer;

    public FormSession(int delayMs) {
        this.delayMs = delayMs;
        CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        this.http = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(Duration.ofSeconds(20))
                .build();
    }

    public Document get(String url) throws IOException, InterruptedException {
        pause();
        HttpRequest request = base(url).GET().build();
        return send(url, request);
    }

    /** Posts a {@code multipart/form-data} body, which is what these test forms declare. */
    public Document postForm(String url, Map<String, String> fields)
            throws IOException, InterruptedException {
        pause();
        String boundary = "----qparser" + UUID.randomUUID().toString().replace("-", "");
        byte[] body = multipart(boundary, fields);
        HttpRequest request = base(url)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                .build();
        return send(url, request);
    }

    private HttpRequest.Builder base(String url) {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url))
                .header("User-Agent", USER_AGENT)
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "ru,en;q=0.9")
                .timeout(Duration.ofSeconds(60));
        if (referer != null) {
            builder.header("Referer", referer);
        }
        return builder;
    }

    private Document send(String url, HttpRequest request) throws IOException, InterruptedException {
        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() != 200) {
            throw new IOException("HTTP " + response.statusCode() + " from " + url);
        }
        referer = url;
        return Jsoup.parse(response.body(), url);
    }

    private static byte[] multipart(String boundary, Map<String, String> fields) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        for (Map.Entry<String, String> field : fields.entrySet()) {
            String part = "--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"" + field.getKey() + "\"\r\n\r\n"
                    + (field.getValue() == null ? "" : field.getValue()) + "\r\n";
            out.write(part.getBytes(StandardCharsets.UTF_8));
        }
        out.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        return out.toByteArray();
    }

    private void pause() throws InterruptedException {
        if (delayMs > 0) {
            Thread.sleep(delayMs);
        }
    }

    @Override
    public void close() {
        http.close();
    }
}
