package com.insurai.backend.service;

import com.insurai.backend.entity.AgentAvailability;
import com.insurai.backend.entity.Appointment;
import com.insurai.backend.entity.Claim;
import com.insurai.backend.entity.ClaimInspection;
import com.insurai.backend.entity.Grievance;
import com.insurai.backend.entity.InsurancePlan;
import com.insurai.backend.entity.Policy;
import com.insurai.backend.entity.PolicyAmendment;
import com.insurai.backend.entity.PolicyDocument;
import com.insurai.backend.entity.UnderwritingLog;
import com.insurai.backend.entity.User;
import com.insurai.backend.repository.AgentAvailabilityRepository;
import com.insurai.backend.repository.AppointmentRepository;
import com.insurai.backend.repository.ClaimInspectionRepository;
import com.insurai.backend.repository.ClaimRepository;
import com.insurai.backend.repository.GrievanceRepository;
import com.insurai.backend.repository.InsurancePlanRepository;
import com.insurai.backend.repository.PolicyAmendmentRepository;
import com.insurai.backend.repository.PolicyDocumentRepository;
import com.insurai.backend.repository.PolicyRepository;
import com.insurai.backend.repository.UnderwritingLogRepository;
import com.insurai.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ExperienceService {

    private final UserRepository userRepository;
    private final InsurancePlanRepository planRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final AppointmentRepository appointmentRepository;
    private final GrievanceRepository grievanceRepository;
    private final AgentAvailabilityRepository availabilityRepository;
    private final PolicyDocumentRepository policyDocumentRepository;
    private final PolicyAmendmentRepository policyAmendmentRepository;
    private final UnderwritingLogRepository underwritingLogRepository;
    private final ClaimInspectionRepository claimInspectionRepository;

    public ExperienceService(
            UserRepository userRepository,
            InsurancePlanRepository planRepository,
            PolicyRepository policyRepository,
            ClaimRepository claimRepository,
            AppointmentRepository appointmentRepository,
            GrievanceRepository grievanceRepository,
            AgentAvailabilityRepository availabilityRepository,
            PolicyDocumentRepository policyDocumentRepository,
            PolicyAmendmentRepository policyAmendmentRepository,
            UnderwritingLogRepository underwritingLogRepository,
            ClaimInspectionRepository claimInspectionRepository
    ) {
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.policyRepository = policyRepository;
        this.claimRepository = claimRepository;
        this.appointmentRepository = appointmentRepository;
        this.grievanceRepository = grievanceRepository;
        this.availabilityRepository = availabilityRepository;
        this.policyDocumentRepository = policyDocumentRepository;
        this.policyAmendmentRepository = policyAmendmentRepository;
        this.underwritingLogRepository = underwritingLogRepository;
        this.claimInspectionRepository = claimInspectionRepository;
    }

    public Map<String, Object> getHomeExperience() {
        List<InsurancePlan> plans = planRepository.findAll().stream()
                .sorted(Comparator.comparing(InsurancePlan::getCoverageAmount).reversed())
                .toList();
        List<User> users = userRepository.findAll();
        List<Policy> policies = policyRepository.findAll();
        List<Claim> claims = claimRepository.findAll();
        List<Grievance> grievances = grievanceRepository.findAll();

        long customerCount = users.stream().filter(user -> isCustomerRole(user.getRole())).count();
        long activePolicies = policies.stream().filter(policy -> "ACTIVE".equalsIgnoreCase(policy.getStatus())).count();
        long openClaims = claims.stream().filter(claim -> "PENDING".equalsIgnoreCase(claim.getStatus())).count();
        long openGrievances = grievances.stream().filter(item -> !"RESOLVED".equalsIgnoreCase(item.getStatus())).count();

        List<Map<String, Object>> featuredPlans = plans.stream()
                .limit(6)
                .map(plan -> mapOf(
                        "id", plan.getPlanId(),
                        "name", plan.getPlanName(),
                        "category", plan.getCategory(),
                        "basePremium", plan.getBasePremium(),
                        "coverageAmount", plan.getCoverageAmount(),
                        "description", Optional.ofNullable(plan.getDescription()).orElse("Protection and service automation tailored to your portfolio."),
                        "featureBullets", splitBullets(plan.getFeatures())
                ))
                .toList();

        return mapOf(
                "hero", mapOf(
                        "eyebrow", "InsurAI: Corporate Policy Automation and Intelligence System",
                        "title", "LIC-style trust, enterprise insurance workflows, and AI-led operations in one MySQL-backed platform.",
                        "subtitle", "Built around live policy, claims, underwriting, and service data so the product behaves like a real insurance operations system instead of a static showcase.",
                        "benchmark", "Product direction blends public LIC service patterns with policy administration, billing, claims, portal, and analytics capabilities commonly highlighted by global insurance platforms."
                ),
                "heroStats", List.of(
                        stat("Available plans", String.valueOf(plans.size()), "Insurance products currently stored in the live product catalog."),
                        stat("Registered customers", String.valueOf(customerCount), "Customer records available for servicing and portfolio tracking."),
                        stat("Active policies", String.valueOf(activePolicies), "Policies currently in force across the MySQL portfolio."),
                        stat("Open service items", String.valueOf(openClaims + openGrievances), "Pending claims and unresolved grievances needing action.")
                ),
                "serviceRail", List.of(
                        serviceCard("Premium pay and renewal", "Support continuous premium collection, renewal nudges, and policy continuation from one servicing layer.", "Renew with confidence"),
                        serviceCard("Claims registration and triage", "Create claims, review status bands, and inspect AI-assisted signals for payout confidence and escalation.", "Track claims faster"),
                        serviceCard("Policy vault and downloads", "Keep digital policy artifacts, verification fingerprints, amendments, and servicing milestones together.", "Open the vault"),
                        serviceCard("Advisor callback and branch support", "Offer assisted selling and service journeys through callback scheduling, branch hubs, and agent capacity views.", "Book an advisor")
                ),
                "platformModules", List.of(
                        platformModule("Policy administration", "Product catalog, servicing, amendments, and document generation."),
                        platformModule("Billing and renewals", "Premium visibility, upcoming renewal radar, and collections-at-risk insights."),
                        platformModule("Claims operations", "FNOL intake, status updates, fraud-aware inspection signals, and SLA tracking."),
                        platformModule("Underwriting intelligence", "Rule-based risk scoring, straight-through processing cues, and audit logs."),
                        platformModule("Portals and servicing", "Customer, advisor, and control-tower views aligned to real insurance roles."),
                        platformModule("Analytics and decisioning", "Portfolio health score, grievance backlog signals, and next-best-action playbooks.")
                ),
                "differentiators", List.of(
                        differentiator("Policy Health Score", "Blends claim behaviour, active coverage, and service backlog into a single portfolio quality index."),
                        differentiator("Renewal Autopilot", "Flags policies nearing expiry, suggests advisor outreach, and prioritizes at-risk premium."),
                        differentiator("Claim Vision", "Adds AI-style evidence interpretation and fraud suspicion markers to standard claims workflows."),
                        differentiator("Executive Control Tower", "Turns transactional insurance data into board-ready portfolio, grievance, and service views."),
                        differentiator("Contextual Copilot", "Answers questions in the language of customers, operations leads, or CXOs with platform-aware insights.")
                ),
                "featuredPlans", featuredPlans,
                "branches", List.of(
                        branch("Bengaluru Digital Hub", "Policy servicing, digital claims desk, and executive account reviews."),
                        branch("Mumbai Enterprise Desk", "Corporate renewals, liability products, and boardroom advisory."),
                        branch("Pune Claims Response Cell", "Motor, health, and field-inspection operations with AI-assisted triage.")
                )
        );
    }

    public Map<String, Object> getCustomerExperience(Long userId) {
        User customer = resolveCustomer(userId);
        List<Policy> policies = policyRepository.findByUserId(customer.getId()).stream()
                .sorted(Comparator.comparing(Policy::getEndDate))
                .toList();
        Map<Long, InsurancePlan> plansById = planRepository.findAll().stream()
                .collect(Collectors.toMap(InsurancePlan::getPlanId, plan -> plan));
        List<Long> policyIds = policies.stream().map(Policy::getPolicyId).toList();
        List<Claim> claims = policyIds.isEmpty() ? List.of() : claimRepository.findByPolicyIdIn(policyIds);
        List<Appointment> appointments = appointmentRepository.findByCustomerId(customer.getId()).stream()
                .sorted(Comparator.comparing(Appointment::getAppointmentDate).thenComparing(Appointment::getTimeSlot))
                .toList();
        List<PolicyDocument> documents = policyDocumentRepository.findByUserEmail(customer.getEmail()).stream()
                .sorted(Comparator.comparing(PolicyDocument::getCreatedAt).reversed())
                .toList();
        List<PolicyAmendment> amendments = policyIds.isEmpty() ? List.of() : policyAmendmentRepository.findByPolicyIdIn(policyIds);

        Map<Long, Long> claimCountByPolicy = claims.stream()
                .collect(Collectors.groupingBy(Claim::getPolicyId, Collectors.counting()));

        BigDecimal totalCoverage = policies.stream()
                .map(policy -> plansById.get(policy.getPlanId()))
                .filter(plan -> plan != null)
                .map(InsurancePlan::getCoverageAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        double totalPremium = policies.stream().mapToDouble(Policy::getPremiumPaid).sum();
        long activePolicies = policies.stream().filter(policy -> "ACTIVE".equalsIgnoreCase(policy.getStatus())).count();
        long expiringSoon = policies.stream()
                .filter(policy -> daysUntil(policy.getEndDate()) <= 60 && daysUntil(policy.getEndDate()) >= 0)
                .count();
        double portfolioHealthScore = calculatePortfolioHealth(policies, claims, amendments);

        List<Map<String, Object>> policyCards = policies.stream()
                .map(policy -> {
                    InsurancePlan plan = plansById.get(policy.getPlanId());
                    long daysRemaining = daysUntil(policy.getEndDate());
                    return mapOf(
                            "policyId", policy.getPolicyId(),
                            "policyNumber", buildPolicyNumber(policy.getPolicyId()),
                            "planName", plan != null ? plan.getPlanName() : "Policy",
                            "category", plan != null ? plan.getCategory() : "GENERAL",
                            "coverageAmount", plan != null ? plan.getCoverageAmount() : BigDecimal.ZERO,
                            "premiumPaid", policy.getPremiumPaid(),
                            "status", policy.getStatus(),
                            "startDate", policy.getStartDate(),
                            "endDate", policy.getEndDate(),
                            "daysRemaining", daysRemaining,
                            "claimCount", claimCountByPolicy.getOrDefault(policy.getPolicyId(), 0L),
                            "nominee", policy.getNomineeName(),
                            "renewalUrgency", daysRemaining <= 30 ? "HIGH" : daysRemaining <= 90 ? "MEDIUM" : "LOW"
                    );
                })
                .toList();

        List<Map<String, Object>> claimRows = claims.stream()
                .sorted(Comparator.comparing(Claim::getIncidentDate).reversed())
                .map(claim -> {
                    Policy policy = policies.stream()
                            .filter(item -> item.getPolicyId().equals(claim.getPolicyId()))
                            .findFirst()
                            .orElse(null);
                    InsurancePlan plan = policy == null ? null : plansById.get(policy.getPlanId());
                    return mapOf(
                            "claimId", claim.getClaimId(),
                            "policyId", claim.getPolicyId(),
                            "planName", plan != null ? plan.getPlanName() : "Policy",
                            "reason", claim.getReason(),
                            "claimAmount", claim.getClaimAmount(),
                            "status", claim.getStatus(),
                            "incidentDate", claim.getIncidentDate()
                    );
                })
                .toList();

        List<Map<String, Object>> documentRows = documents.stream()
                .map(document -> mapOf(
                        "policyNumber", document.getPolicyNumber(),
                        "status", document.getStatus(),
                        "hash", document.getDigitalSignatureHash(),
                        "downloadPath", document.getDownloadPath(),
                        "createdAt", document.getCreatedAt()
                ))
                .toList();

        List<Map<String, Object>> appointmentRows = appointments.stream()
                .map(appointment -> mapOf(
                        "appointmentId", appointment.getAppointmentId(),
                        "date", appointment.getAppointmentDate(),
                        "time", appointment.getTimeSlot(),
                        "status", appointment.getStatus(),
                        "meetingLink", appointment.getMeetingLink(),
                        "advisor", userRepository.findById(appointment.getAgentId()).map(User::getFullName).orElse("Advisor")
                ))
                .toList();

        List<Map<String, Object>> amendmentRows = amendments.stream()
                .sorted(Comparator.comparing(PolicyAmendment::getRequestDate, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(amendment -> mapOf(
                        "id", amendment.getId(),
                        "policyId", amendment.getPolicyId(),
                        "changeType", amendment.getChangeType(),
                        "newValue", amendment.getNewValue(),
                        "status", amendment.getStatus(),
                        "requestedAt", amendment.getRequestDate()
                ))
                .toList();

        return mapOf(
                "customer", mapOf(
                        "id", customer.getId(),
                        "name", customer.getFullName(),
                        "email", customer.getEmail(),
                        "phoneNumber", customer.getPhoneNumber()
                ),
                "summary", mapOf(
                        "portfolioHealthScore", portfolioHealthScore,
                        "activePolicies", activePolicies,
                        "expiringSoon", expiringSoon,
                        "totalCoverage", totalCoverage,
                        "totalPremium", roundCurrency(totalPremium)
                ),
                "heroMetrics", List.of(
                        stat("Active policies", String.valueOf(activePolicies), "Coverage currently in force for this customer."),
                        stat("Total protection", formatCurrency(totalCoverage), "Combined insured value across the customer portfolio."),
                        stat("Annual premium", formatCurrency(BigDecimal.valueOf(totalPremium)), "Expected yearly outflow based on live policy records."),
                        stat("Renewals due", String.valueOf(expiringSoon), "Policies that need attention within the next 60 days.")
                ),
                "nextActions", buildCustomerActions(policyCards, claimRows, amendmentRows),
                "recommendations", buildCustomerRecommendations(customer.getFullName(), portfolioHealthScore, expiringSoon),
                "policies", policyCards,
                "claims", claimRows,
                "documents", documentRows,
                "appointments", appointmentRows,
                "amendments", amendmentRows,
                "timeline", buildCustomerTimeline(policyCards, claimRows, appointmentRows, amendmentRows)
        );
    }

    public Map<String, Object> getOperationsExperience() {
        List<Policy> policies = policyRepository.findAll();
        List<User> agents = userRepository.findByRole("AGENT");
        List<UnderwritingLog> logs = underwritingLogRepository.findAll().stream()
                .sorted(Comparator.comparing(UnderwritingLog::getCreatedAt).reversed())
                .toList();
        List<Grievance> grievances = grievanceRepository.findAll();

        long autoApproved = logs.stream().filter(log -> "AUTO_APPROVED".equalsIgnoreCase(log.getDecision())).count();
        double straightThroughRate = logs.isEmpty() ? 0 : (double) autoApproved * 100 / logs.size();
        List<Policy> renewals = policies.stream()
                .filter(policy -> daysUntil(policy.getEndDate()) <= 120 && daysUntil(policy.getEndDate()) >= 0)
                .sorted(Comparator.comparing(Policy::getEndDate))
                .toList();

        List<Map<String, Object>> renewalRadar = renewals.stream()
                .map(policy -> {
                    InsurancePlan plan = planRepository.findById(policy.getPlanId()).orElse(null);
                    User customer = userRepository.findById(policy.getUserId()).orElse(null);
                    return mapOf(
                            "policyId", policy.getPolicyId(),
                            "policyNumber", buildPolicyNumber(policy.getPolicyId()),
                            "customer", customer != null ? customer.getFullName() : "Customer",
                            "planName", plan != null ? plan.getPlanName() : "Plan",
                            "premiumPaid", policy.getPremiumPaid(),
                            "daysRemaining", daysUntil(policy.getEndDate()),
                            "recommendedAction", daysUntil(policy.getEndDate()) <= 30 ? "Escalate renewal call" : "Send digital reminder"
                    );
                })
                .toList();

        List<Map<String, Object>> underwritingQueue = logs.stream()
                .map(log -> mapOf(
                        "email", log.getUserEmail(),
                        "riskScore", log.getRiskScore(),
                        "decision", log.getDecision(),
                        "premium", log.getPremium(),
                        "createdAt", log.getCreatedAt(),
                        "reason", underwritingReason(log.getRiskScore(), log.getDecision())
                ))
                .toList();

        List<Map<String, Object>> agentCapacity = agents.stream()
                .map(agent -> {
                    List<AgentAvailability> slots = availabilityRepository.findByAgentId(agent.getId());
                    List<Appointment> workload = appointmentRepository.findByAgentId(agent.getId());
                    return mapOf(
                            "agent", agent.getFullName(),
                            "daysConfigured", slots.size(),
                            "appointments", workload.size(),
                            "nextAvailable", slots.stream()
                                    .sorted(Comparator.comparing(AgentAvailability::getDayOfWeek))
                                    .findFirst()
                                    .map(slot -> slot.getDayOfWeek() + " " + slot.getStartTime())
                                    .orElse("Needs calendar setup"),
                            "utilization", workload.size() >= 4 ? "High" : workload.size() >= 2 ? "Balanced" : "Open"
                    );
                })
                .toList();

        return mapOf(
                "heroMetrics", List.of(
                        stat("Straight-through underwriting", percentage(straightThroughRate), "Share of logged cases approved without manual intervention."),
                        stat("Renewals in 120 days", String.valueOf(renewals.size()), "Policies requiring prioritised outreach and collections action."),
                        stat("Service backlog", String.valueOf(grievances.stream().filter(item -> !"RESOLVED".equalsIgnoreCase(item.getStatus())).count()), "Open grievances and service exceptions across the portfolio."),
                        stat("Advisor coverage", String.valueOf(agents.size()), "Configured agents available for sales, renewals, and service callbacks.")
                ),
                "benchmarkNotes", List.of(
                        platformModule("Policy servicing", "Amendments, renewals, and premium visibility aligned to modern insurance core platforms."),
                        platformModule("Underwriting workflow", "Rule-based scoring, escalation paths, and auditability for compliance."),
                        platformModule("Agent operations", "Calendar coverage, callback loads, and balanced advisor routing."),
                        platformModule("Back-office automation", "Renewal prioritisation, grievance routing, and next-best-task orchestration.")
                ),
                "renewalRadar", renewalRadar,
                "underwritingQueue", underwritingQueue,
                "agentCapacity", agentCapacity,
                "automationPlaybooks", List.of(
                        serviceCard("Renewal Autopilot", "Prioritize high-value renewals first, push nudges, then convert to advisor tasks when risk rises.", "Stabilize retention"),
                        serviceCard("Amendment SLA Engine", "Move nominee, address, and phone-change requests through an auditable approval queue.", "Reduce service delays"),
                        serviceCard("Service Recovery Trigger", "Escalate unresolved grievances into management visibility once SLA thresholds are missed.", "Protect CX score")
                )
        );
    }

    public Map<String, Object> getClaimsExperience() {
        List<Claim> claims = claimRepository.findAll().stream()
                .sorted(Comparator.comparing(Claim::getIncidentDate).reversed())
                .toList();
        List<ClaimInspection> inspections = claimInspectionRepository.findAll().stream()
                .sorted(Comparator.comparing(ClaimInspection::getCreatedAt).reversed())
                .toList();

        long pending = claims.stream().filter(claim -> "PENDING".equalsIgnoreCase(claim.getStatus())).count();
        long approved = claims.stream().filter(claim -> "APPROVED".equalsIgnoreCase(claim.getStatus())).count();
        long flagged = inspections.stream().filter(item -> item.getAiAssessment() != null && item.getAiAssessment().contains("FLAGGED")).count();
        double avgConfidence = inspections.stream().mapToDouble(ClaimInspection::getConfidenceScore).average().orElse(0);

        List<Map<String, Object>> board = claims.stream()
                .map(claim -> {
                    Policy policy = policyRepository.findById(claim.getPolicyId()).orElse(null);
                    InsurancePlan plan = policy == null ? null : planRepository.findById(policy.getPlanId()).orElse(null);
                    User customer = policy == null ? null : userRepository.findById(policy.getUserId()).orElse(null);
                    return mapOf(
                            "claimId", claim.getClaimId(),
                            "customer", customer != null ? customer.getFullName() : "Customer",
                            "policyNumber", buildPolicyNumber(claim.getPolicyId()),
                            "planName", plan != null ? plan.getPlanName() : "Policy",
                            "reason", claim.getReason(),
                            "claimAmount", claim.getClaimAmount(),
                            "status", claim.getStatus(),
                            "incidentDate", claim.getIncidentDate(),
                            "sla", "PENDING".equalsIgnoreCase(claim.getStatus()) ? "Watch 24h" : "Within SLA"
                    );
                })
                .toList();

        List<Map<String, Object>> inspectionSignals = inspections.stream()
                .map(inspection -> mapOf(
                        "claimNumber", inspection.getClaimNumber(),
                        "userEmail", inspection.getUserEmail(),
                        "assessment", inspection.getAiAssessment(),
                        "confidence", inspection.getConfidenceScore(),
                        "estimatedPayout", inspection.getEstimatedPayout(),
                        "description", inspection.getDescription()
                ))
                .toList();

        return mapOf(
                "heroMetrics", List.of(
                        stat("Open claims", String.valueOf(pending), "Claims awaiting review or decision."),
                        stat("Approval ratio", percentage(claims.isEmpty() ? 0 : (double) approved * 100 / claims.size()), "Auto and manual approval performance."),
                        stat("AI fraud flags", String.valueOf(flagged), "Inspections requiring manual scrutiny."),
                        stat("AI confidence", percentage(avgConfidence), "Average certainty across inspected claims.")
                ),
                "claimsBoard", board,
                "inspectionSignals", inspectionSignals,
                "playbooks", List.of(
                        serviceCard("FNOL acceleration", "Register first notice quickly with richer reason capture and instant status bands.", "Improve TAT"),
                        serviceCard("Repair and hospital coordination", "Use payout estimates and case status to guide providers and customers.", "Reduce leakage"),
                        serviceCard("Fraud-aware review", "Bring suspicious evidence, duplicate wording, and outlier payouts into one analyst view.", "Strengthen controls")
                )
        );
    }

    public Map<String, Object> getControlTowerExperience() {
        List<User> users = userRepository.findAll();
        List<Policy> policies = policyRepository.findAll();
        List<Grievance> grievances = grievanceRepository.findAll().stream()
                .sorted(Comparator.comparing(Grievance::getSubmissionDate).reversed())
                .toList();
        List<InsurancePlan> plans = planRepository.findAll();

        double grossPremium = policies.stream().mapToDouble(Policy::getPremiumPaid).sum();
        long activePolicies = policies.stream().filter(policy -> "ACTIVE".equalsIgnoreCase(policy.getStatus())).count();
        long resolvedGrievances = grievances.stream().filter(item -> "RESOLVED".equalsIgnoreCase(item.getStatus())).count();
        double grievanceResolution = grievances.isEmpty() ? 0 : (double) resolvedGrievances * 100 / grievances.size();

        Map<String, Long> categoryMix = policies.stream()
                .map(policy -> planRepository.findById(policy.getPlanId()).orElse(null))
                .filter(plan -> plan != null)
                .collect(Collectors.groupingBy(InsurancePlan::getCategory, Collectors.counting()));

        List<Map<String, Object>> grievanceQueue = grievances.stream()
                .map(grievance -> mapOf(
                        "id", grievance.getId(),
                        "customer", userRepository.findById(grievance.getUserId()).map(User::getFullName).orElse("Customer"),
                        "type", grievance.getType(),
                        "priority", grievance.getPriority(),
                        "status", grievance.getStatus(),
                        "description", grievance.getDescription(),
                        "submittedAt", grievance.getSubmissionDate()
                ))
                .toList();

        List<Map<String, Object>> mix = plans.stream()
                .map(plan -> mapOf(
                        "category", plan.getCategory(),
                        "count", categoryMix.getOrDefault(plan.getCategory(), 0L),
                        "planName", plan.getPlanName()
                ))
                .toList();

        return mapOf(
                "heroMetrics", List.of(
                        stat("In-force policies", String.valueOf(activePolicies), "Live book-of-business volume across product lines."),
                        stat("Gross written premium", formatCurrency(BigDecimal.valueOf(grossPremium)), "Premium booked in the current MySQL portfolio."),
                        stat("Service resolution", percentage(grievanceResolution), "Closed-loop grievance performance."),
                        stat("Active users", String.valueOf(users.size()), "Customers, agents, and admin personas available in the platform.")
                ),
                "productMix", mix,
                "grievanceQueue", grievanceQueue,
                "branchNetwork", List.of(
                        branch("National Service Command", "Monitors grievances, callbacks, and document SLAs across all branches."),
                        branch("Advisor Growth Desk", "Measures conversion, workload, and agent capacity by city cluster."),
                        branch("Claims Intelligence Cell", "Tracks approvals, fraud flags, and loss trends for leadership reviews.")
                ),
                "complianceAlerts", List.of(
                        differentiator("Pending amendments", "Ensure policy master updates follow approval status to avoid servicing gaps."),
                        differentiator("Renewal exposure", "High-value policies expiring inside 30 days should trigger assisted outreach."),
                        differentiator("Fraud watchlist", "Claims flagged by AI review need a manual checkpoint before payout.")
                )
        );
    }

    public Map<String, Object> askCopilot(String persona, String question) {
        String normalizedQuestion = Optional.ofNullable(question).orElse("").toLowerCase(Locale.ENGLISH);
        String normalizedPersona = Optional.ofNullable(persona).filter(value -> !value.isBlank()).orElse("Portfolio Advisor");

        List<Policy> policies = policyRepository.findAll();
        List<Claim> claims = claimRepository.findAll();
        List<Grievance> grievances = grievanceRepository.findAll();
        List<UnderwritingLog> logs = underwritingLogRepository.findAll();

        String answer;
        List<String> actions;
        List<String> references = new ArrayList<>();

        if (normalizedQuestion.contains("renew")) {
            long expiringSoon = policies.stream()
                    .filter(policy -> daysUntil(policy.getEndDate()) <= 60 && daysUntil(policy.getEndDate()) >= 0)
                    .count();
            answer = "InsurAI sees " + expiringSoon + " policies nearing renewal in the next 60 days. Prioritize digital nudges for medium-risk cases and assisted outreach for high-premium or under-serviced accounts.";
            actions = List.of("Open renewal radar", "Schedule callback", "Trigger retention playbook");
            references.add("Renewal Autopilot");
            references.add("Policy end-date exposure");
        } else if (normalizedQuestion.contains("claim")) {
            long pendingClaims = claims.stream().filter(claim -> "PENDING".equalsIgnoreCase(claim.getStatus())).count();
            long flaggedInspections = claimInspectionRepository.findAll().stream()
                    .filter(item -> item.getAiAssessment() != null && item.getAiAssessment().contains("FLAGGED"))
                    .count();
            answer = "There are " + pendingClaims + " pending claims and " + flaggedInspections + " AI-flagged inspections. Focus first on large-value claims with incomplete evidence and keep providers updated on expected payout timing.";
            actions = List.of("Review claims board", "Inspect AI signals", "Escalate high-value case");
            references.add("Claims board");
            references.add("Claim Vision signals");
        } else if (normalizedQuestion.contains("underwriting") || normalizedQuestion.contains("risk")) {
            long manualReview = logs.stream().filter(log -> log.getDecision() != null && log.getDecision().contains("PENDING")).count();
            answer = "The underwriting queue currently shows " + manualReview + " cases waiting for manual review. Age, health disclosures, and hazardous occupations remain the largest drivers of escalation in the current portfolio.";
            actions = List.of("Run a risk simulation", "Review audit log", "Refine pricing bands");
            references.add("Underwriting audit");
            references.add("Risk scoring rules");
        } else if (normalizedQuestion.contains("grievance") || normalizedQuestion.contains("service")) {
            long unresolved = grievances.stream().filter(item -> !"RESOLVED".equalsIgnoreCase(item.getStatus())).count();
            answer = "There are " + unresolved + " unresolved service items. Use severity-based routing and fast closure on address or nominee changes to protect customer sentiment.";
            actions = List.of("Open grievance queue", "Resolve high priority item", "Launch service recovery trigger");
            references.add("Control Tower");
            references.add("Service recovery workflow");
        } else {
            answer = "InsurAI is strongest when you ask about policy renewals, claims, underwriting, advisor capacity, or service operations. I can answer from the live operational portfolio and turn that into next-best actions.";
            actions = List.of("Ask about renewals", "Ask about claims risk", "Ask about underwriting workload");
            references.add("Live operational portfolio");
        }

        return mapOf(
                "persona", normalizedPersona,
                "answer", answer,
                "actions", actions,
                "confidence", "0.91",
                "references", references
        );
    }

    public Map<String, Object> requestCallback(Map<String, String> request) {
        User customer = resolveCustomer(parseLong(request.get("customerId")));
        User advisor = userRepository.findByRole("AGENT").stream().findFirst().orElseThrow();

        Appointment appointment = new Appointment();
        appointment.setCustomerId(customer.getId());
        appointment.setAgentId(advisor.getId());
        appointment.setAppointmentDate(LocalDate.now().plusDays(1));
        appointment.setTimeSlot(LocalTime.of(11, 30));
        appointment.setStatus("SCHEDULED");

        Appointment saved = appointmentRepository.save(appointment);
        String serviceType = Optional.ofNullable(request.get("serviceType")).filter(value -> !value.isBlank()).orElse("Portfolio review");
        String preferredWindow = Optional.ofNullable(request.get("preferredWindow")).filter(value -> !value.isBlank()).orElse("11:30 AM");

        return mapOf(
                "reference", "CALL-" + saved.getAppointmentId(),
                "message", "Advisor callback scheduled successfully against the live portfolio.",
                "serviceType", serviceType,
                "preferredWindow", preferredWindow,
                "advisor", advisor.getFullName(),
                "date", saved.getAppointmentDate(),
                "time", saved.getTimeSlot(),
                "meetingLink", saved.getMeetingLink()
        );
    }

    private User resolveCustomer(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId).orElseGet(this::getDefaultCustomer);
        }
        return getDefaultCustomer();
    }

    private User getDefaultCustomer() {
        return Stream.of(
                        userRepository.findByRole("CUSTOMER").stream(),
                        userRepository.findByRole("USER").stream(),
                        userRepository.findAll().stream().filter(user -> isCustomerRole(user.getRole()))
                )
                .flatMap(stream -> stream)
                .min(Comparator.comparing(User::getId))
                .orElseGet(() -> userRepository.findAll().stream()
                        .min(Comparator.comparing(User::getId))
                        .orElseThrow());
    }

    private List<Map<String, Object>> buildCustomerActions(
            List<Map<String, Object>> policies,
            List<Map<String, Object>> claims,
            List<Map<String, Object>> amendments
    ) {
        List<Map<String, Object>> actions = new ArrayList<>();

        policies.stream()
                .filter(policy -> "HIGH".equals(policy.get("renewalUrgency")))
                .findFirst()
                .ifPresent(policy -> actions.add(serviceCard(
                        "Renew " + policy.get("planName"),
                        "This policy expires in " + policy.get("daysRemaining") + " days and should be renewed first.",
                        "Pay renewal"
                )));

        claims.stream()
                .filter(claim -> "PENDING".equals(claim.get("status")))
                .findFirst()
                .ifPresent(claim -> actions.add(serviceCard(
                        "Upload claim support",
                        "Claim #" + claim.get("claimId") + " is pending. Add missing documents or speak to an advisor.",
                        "Resolve claim"
                )));

        amendments.stream()
                .filter(amendment -> "PENDING".equals(amendment.get("status")))
                .findFirst()
                .ifPresent(amendment -> actions.add(serviceCard(
                        "Track policy amendment",
                        "Your " + amendment.get("changeType") + " change is still awaiting approval.",
                        "View request"
                )));

        if (actions.isEmpty()) {
            actions.add(serviceCard("Portfolio is healthy", "No urgent service actions are pending right now.", "Explore opportunities"));
        }

        return actions;
    }

    private List<Map<String, Object>> buildCustomerRecommendations(String fullName, double healthScore, long expiringSoon) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        recommendations.add(differentiator(
                "Portfolio guidance for " + fullName,
                "Review nominee details, rider coverage, and policy milestones regularly to keep the portfolio healthy and service-ready."
        ));
        recommendations.add(differentiator(
                "Policy Health Score",
                "Current score is " + String.format(Locale.ENGLISH, "%.1f", healthScore) + ". Faster amendment closure and on-time renewals will push it higher."
        ));
        recommendations.add(differentiator(
                "Service forecast",
                expiringSoon > 0
                        ? "At least one policy needs renewal planning soon. Use digital payment first, then advisor support if needed."
                        : "No near-term renewals are at risk, so focus on optimization and rider reviews."
        ));
        return recommendations;
    }

    private List<Map<String, Object>> buildCustomerTimeline(
            List<Map<String, Object>> policies,
            List<Map<String, Object>> claims,
            List<Map<String, Object>> appointments,
            List<Map<String, Object>> amendments
    ) {
        return Stream.of(
                        policies.stream().map(policy -> timelineItem(
                                toDateTime(policy.get("startDate"), LocalTime.NOON),
                                "Policy activated",
                                policy.get("planName") + " is part of your active portfolio.",
                                "policy"
                        )),
                        claims.stream().map(claim -> timelineItem(
                                toDateTime(claim.get("incidentDate"), LocalTime.of(9, 0)),
                                "Claim update",
                                claim.get("reason") + " is currently marked " + claim.get("status") + ".",
                                "claim"
                        )),
                        appointments.stream().map(appointment -> timelineItem(
                                toDateTime(appointment.get("date"), appointment.get("time")),
                                "Advisor session",
                                "Session with " + appointment.get("advisor") + " is " + appointment.get("status") + ".",
                                "appointment"
                        )),
                        amendments.stream().map(amendment -> timelineItem(
                                amendment.get("requestedAt"),
                                "Policy amendment",
                                amendment.get("changeType") + " request is " + amendment.get("status") + ".",
                                "amendment"
                        ))
                )
                .flatMap(stream -> stream)
                .sorted((left, right) -> compareTimeline(right.get("timestamp"), left.get("timestamp")))
                .limit(8)
                .toList();
    }

    private double calculatePortfolioHealth(List<Policy> policies, List<Claim> claims, List<PolicyAmendment> amendments) {
        if (policies.isEmpty()) {
            return 0;
        }

        double activeRatio = (double) policies.stream().filter(policy -> "ACTIVE".equalsIgnoreCase(policy.getStatus())).count() / policies.size();
        double claimPenalty = claims.stream().filter(claim -> "PENDING".equalsIgnoreCase(claim.getStatus())).count() * 4.0;
        double amendmentPenalty = amendments.stream().filter(item -> "PENDING".equalsIgnoreCase(item.getStatus())).count() * 2.5;
        double score = 70 + (activeRatio * 20) - claimPenalty - amendmentPenalty;
        return Math.max(55, Math.min(98, roundCurrency(score)));
    }

    private String underwritingReason(int score, String decision) {
        if (decision != null && decision.contains("REJECTED")) {
            return "High-risk disclosures exceeded the configured threshold.";
        }
        if (score >= 50) {
            return "Manual review triggered by cumulative age, health, or occupation signals.";
        }
        return "Application fits the straight-through risk appetite.";
    }

    private Map<String, Object> stat(String label, String value, String description) {
        return mapOf("label", label, "value", value, "description", description);
    }

    private Map<String, Object> serviceCard(String title, String description, String cta) {
        return mapOf("title", title, "description", description, "cta", cta);
    }

    private Map<String, Object> platformModule(String title, String description) {
        return mapOf("title", title, "description", description);
    }

    private Map<String, Object> differentiator(String title, String description) {
        return mapOf("title", title, "description", description);
    }

    private Map<String, Object> branch(String name, String focus) {
        return mapOf("name", name, "focus", focus);
    }

    private Map<String, Object> timelineItem(Object timestamp, String title, String description, String tone) {
        return mapOf("timestamp", timestamp, "title", title, "description", description, "tone", tone);
    }

    private Map<String, Object> mapOf(Object... keyValues) {
        LinkedHashMap<String, Object> map = new LinkedHashMap<>();
        for (int index = 0; index < keyValues.length; index += 2) {
            map.put((String) keyValues[index], keyValues[index + 1]);
        }
        return map;
    }

    private List<String> splitBullets(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of("Policy feature data will appear here as product records are enriched.");
        }

        if (raw.contains("|")) {
            return List.of(raw.split("\\|"));
        }

        if (raw.contains(",")) {
            return List.of(raw.split(","));
        }

        return List.of(raw);
    }

    private long daysUntil(LocalDate date) {
        return ChronoUnit.DAYS.between(LocalDate.now(), date);
    }

    private LocalDateTime toDateTime(Object dateObject, Object timeObject) {
        LocalDate date = (LocalDate) dateObject;
        LocalTime time = timeObject instanceof LocalTime localTime ? localTime : LocalTime.NOON;
        return date.atTime(time);
    }

    private int compareTimeline(Object left, Object right) {
        return asDateTime(left).compareTo(asDateTime(right));
    }

    private LocalDateTime asDateTime(Object value) {
        if (value instanceof LocalDateTime dateTime) {
            return dateTime;
        }
        if (value instanceof LocalDate date) {
            return date.atTime(LocalTime.NOON);
        }
        return LocalDateTime.now();
    }

    private String buildPolicyNumber(Long policyId) {
        return "INS-" + String.format("%06d", policyId);
    }

    private String formatCurrency(BigDecimal value) {
        return "INR " + value.setScale(0, RoundingMode.HALF_UP).toPlainString();
    }

    private String percentage(double value) {
        return String.format(Locale.ENGLISH, "%.0f%%", value);
    }

    private double roundCurrency(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private boolean isCustomerRole(String role) {
        return "CUSTOMER".equalsIgnoreCase(role) || "USER".equalsIgnoreCase(role);
    }

    private Long parseLong(String rawValue) {
        try {
            return rawValue == null || rawValue.isBlank() ? null : Long.parseLong(rawValue);
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
