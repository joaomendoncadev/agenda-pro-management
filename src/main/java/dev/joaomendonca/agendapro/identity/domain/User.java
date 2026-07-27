package dev.joaomendonca.agendapro.identity.domain;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "users")
public class User {
    @Id
    private UUID id;
    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;
    @Column(nullable = false, length = 120)
    private String name;
    @Column(nullable = false, unique = true, length = 180)
    private String email;
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;
    @Column(nullable = false)
    private boolean active;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", nullable = false, length = 40)
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = new HashSet<>();
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected User() {}

    public User(UUID id, UUID tenantId, String name, String email, String passwordHash, Set<Role> roles) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = new HashSet<>(roles);
        this.active = true;
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public boolean isActive() { return active; }
    public Set<Role> getRoles() { return Set.copyOf(roles); }
}
