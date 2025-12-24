FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Pre-download dependencies for better layer caching
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw -B -q dependency:go-offline

# Copy the full source and create the runnable jar
COPY src src
RUN ./mvnw -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

# Expose the default Spring Boot port (override with SERVER_PORT)
EXPOSE 8080

COPY --from=builder /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
