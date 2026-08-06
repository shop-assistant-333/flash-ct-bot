FROM eclipse-temurin:21-jre-alpine
# Lesson opening dates are typed in by the admin as local time and compared against the clock of
# the server, so the container has to run in the timezone the school lives in.
RUN apk add --no-cache tzdata
ENV TZ=Europe/Minsk
WORKDIR /app
COPY target/exam-preparation-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
