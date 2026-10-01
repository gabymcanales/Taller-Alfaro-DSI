# ============================================================
# DOCKERFILE - TALLER ALFARO BACKEND
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copiar pom.xml y descargar dependencias (se cachea)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fuente y compilar (sin tests)
COPY src ./src
RUN mvn clean package -DskipTests

# ============================================================
# ETAPA 2: Imagen final liviana
# ============================================================
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copiar el JAR compilado
COPY --from=build /app/target/taller-backend-0.0.1-SNAPSHOT.jar app.jar

# Puerto (Render lo asigna automáticamente)
EXPOSE 8080

# Ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]