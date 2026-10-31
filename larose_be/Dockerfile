# ---- Build ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

# ---- Run ----
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --uid 1001 larose && mkdir -p /app/uploads && chown -R larose /app
COPY --from=build --chown=larose /build/target/*.jar app.jar
USER larose
EXPOSE 8080
VOLUME /app/uploads
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
