CREATE TABLE application_metadata
(
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    metadata_key VARCHAR(100) NOT NULL,
    value        VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT pk_application_metadata PRIMARY KEY (id),
    CONSTRAINT uk_application_metadata_key UNIQUE (metadata_key)
);

INSERT INTO application_metadata (metadata_key, value)
VALUES ('schema.version', '1');
