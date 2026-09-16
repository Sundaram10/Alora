document.addEventListener("DOMContentLoaded", () => {
    // Current Active Role & User
    let currentRole = "STUDENT";
    let currentUser = { id: 2, name: "Aarav Patel", role: "STUDENT" };

    // DOM Elements
    const roleBtns = document.querySelectorAll(".role-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    // Initialize Navigation
    roleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetRole = btn.dataset.role;
            switchRole(targetRole);
        });
    });

    function switchRole(role) {
        currentRole = role;
        roleBtns.forEach(b => b.classList.toggle("active", b.dataset.role === role));
        tabPanes.forEach(p => p.classList.toggle("active", p.dataset.tab === role));

        if (role === "STUDENT") {
            currentUser = { id: 2, name: "Aarav Patel", role: "STUDENT" };
            loadStudentComplaints();
        } else if (role === "ADMIN") {
            currentUser = { id: 1, name: "Campus Admin", role: "ADMIN" };
            loadAdminDashboard();
        } else if (role === "TECH") {
            currentUser = { id: 4, name: "Devendra Singh (Electrician)", role: "TECHNICIAN", dept: "Electrical Maintenance" };
            loadTechnicianDesk();
        } else if (role === "ML") {
            loadMLCenter();
        }
    }

    // Check Backend & ML Health
    async function updateHealthIndicators() {
        const health = await API.checkHealth();
        const beDot = document.getElementById("backend-dot");
        const beText = document.getElementById("backend-text");
        const mlDot = document.getElementById("ml-dot");
        const mlText = document.getElementById("ml-text");

        if (beDot && beText) {
            beDot.style.backgroundColor = health.backend ? "var(--success)" : "var(--warning)";
            beText.textContent = health.backend ? "Backend (Spring Boot): 8080 Active" : "Backend: Demo Mode";
        }
        if (mlDot && mlText) {
            mlDot.style.backgroundColor = health.ml ? "var(--success)" : "var(--warning)";
            mlText.textContent = health.ml ? "AI Engine: 8001 Active" : "AI Engine: Local Core";
        }
    }
    updateHealthIndicators();
    setInterval(updateHealthIndicators, 15000);

    // ==========================================================
    // 1. STUDENT TAB: Submission & Live Duplicate Detection
    // ==========================================================
    const compTitle = document.getElementById("comp-title");
    const compDesc = document.getElementById("comp-desc");
    const compBldg = document.getElementById("comp-building");
    const compDept = document.getElementById("comp-dept");
    const compFloor = document.getElementById("comp-floor");
    const compRoom = document.getElementById("comp-room");
    const dupAlert = document.getElementById("duplicate-alert");
    const dupTitle = document.getElementById("dup-title");
    const dupLocation = document.getElementById("dup-location");
    const dupScore = document.getElementById("dup-score");
    const dupTicket = document.getElementById("dup-ticket");

    const chipCat = document.getElementById("chip-category");
    const chipDept = document.getElementById("chip-department");
    const chipSev = document.getElementById("chip-severity");

    let dupDebounceTimer = null;

    function handleComplaintInput() {
        clearTimeout(dupDebounceTimer);
        const title = compTitle.value.trim();
        const desc = compDesc.value.trim();
        const bldg = compBldg.value;
        const selectedDeptText = compDept && compDept.value ? compDept.options[compDept.selectedIndex].text.replace(/^[^\s]+\s/, '') : null;

        if (!title && !desc) {
            dupAlert.classList.remove("active");
            return;
        }

        // Quick client prediction preview
        const cat = API.detectCategoryFallback(title, desc);
        const dept = selectedDeptText || API.detectDepartmentFallback(title, desc);
        const sev = API.detectSeverityFallback(title, desc);
        if (chipCat) chipCat.textContent = cat;
        if (chipDept) chipDept.textContent = dept;
        if (chipSev) chipSev.textContent = sev;

        dupDebounceTimer = setTimeout(async () => {
            const res = await API.checkDuplicateLive(title, desc, bldg, compFloor.value, compRoom.value);
            if (res && res.is_duplicate && res.matched_complaint) {
                dupTitle.textContent = res.matched_complaint.title;
                dupLocation.textContent = res.matched_complaint.location;
                dupScore.textContent = `${Math.round(res.highest_similarity * 100)}% Match`;
                dupTicket.textContent = res.matched_complaint.tracking_number;
                dupAlert.classList.add("active");
            } else {
                dupAlert.classList.remove("active");
            }
        }, 350);
    }

    if (compTitle) compTitle.addEventListener("input", handleComplaintInput);
    if (compDesc) compDesc.addEventListener("input", handleComplaintInput);
    if (compBldg) compBldg.addEventListener("change", handleComplaintInput);
    if (compDept) compDept.addEventListener("change", handleComplaintInput);

    // Complaint Form Submission
    const complaintForm = document.getElementById("complaint-form");
    if (complaintForm) {
        complaintForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                userId: currentUser.id,
                title: compTitle.value.trim(),
                description: compDesc.value.trim(),
                locationBuilding: compBldg.value,
                locationFloor: compFloor.value.trim(),
                locationRoom: compRoom.value.trim(),
                departmentId: compDept && compDept.value ? parseInt(compDept.value) : null
            };

            const submitBtn = complaintForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.textContent = "AI Triaging & Submitting...";

            const res = await API.submitComplaint(payload);

            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Campus Complaint";

            showToast(`Complaint filed! Tracking: ${res.trackingNumber || 'Registered'}`);
            complaintForm.reset();
            dupAlert.classList.remove("active");
            loadStudentComplaints();
        });
    }

    // Load Student Complaints & Timeline
    async function loadStudentComplaints() {
        const listContainer = document.getElementById("student-complaints-list");
        if (!listContainer) return;

        listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem;">Loading your tickets...</div>`;
        const complaints = await API.getComplaints({ userId: currentUser.id });

        if (!complaints || complaints.length === 0) {
            listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No complaints submitted yet.</div>`;
            return;
        }

        listContainer.innerHTML = complaints.map(c => `
            <div class="card" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div>
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">${c.trackingNumber}</span>
                        <h3 style="font-size: 1.05rem; font-weight: 700; margin-top: 0.2rem;">${escapeHtml(c.title)}</h3>
                    </div>
                    <div>
                        <span class="badge badge-${(c.severity || 'medium').toLowerCase()}">${c.severity || 'MEDIUM'}</span>
                        <span class="status-badge status-${(c.status || 'pending').toLowerCase()}">${c.status || 'PENDING'}</span>
                    </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">${escapeHtml(c.description)}</p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
                    <span>📍 <strong>${escapeHtml(c.locationBuilding || '')}</strong> ${escapeHtml(c.locationRoom || '')}</span>
                    <span>🏷️ <strong>${c.category || 'General'}</strong></span>
                    <span>🏢 <strong>${c.departmentName || 'Campus Maintenance'}</strong></span>
                    ${c.assignedTechnicianName ? `<span>👷 <strong>${c.assignedTechnicianName}</strong></span>` : ''}
                    <span>⏱️ Est: <strong>${c.estimatedResolutionHours || 3.0} hrs</strong></span>
                </div>

                <!-- Live Status Timeline -->
                <div class="timeline" style="margin-top: 1rem; margin-bottom: 0.5rem;">
                    <div class="timeline-step completed">
                        <div class="timeline-dot"></div>
                        <div class="timeline-title">Submitted</div>
                        <div class="timeline-desc">Logged on ${formatDate(c.createdAt)}</div>
                    </div>
                    <div class="timeline-step ${['AI_TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(c.status) ? 'completed' : 'current'}">
                        <div class="timeline-dot"></div>
                        <div class="timeline-title">AI Triaged</div>
                        <div class="timeline-desc">Auto-routed to ${c.departmentName || 'Maintenance'} (Priority: ${c.severity})</div>
                    </div>
                    <div class="timeline-step ${['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(c.status) ? 'completed' : (c.status === 'AI_TRIAGED' ? 'current' : '')}">
                        <div class="timeline-dot"></div>
                        <div class="timeline-title">Assigned & Dispatched</div>
                        <div class="timeline-desc">${c.assignedTechnicianName ? `Assigned to ${c.assignedTechnicianName}` : 'Awaiting technician dispatch'}</div>
                    </div>
                    <div class="timeline-step ${c.status === 'RESOLVED' ? 'completed' : (c.status === 'IN_PROGRESS' ? 'current' : '')}">
                        <div class="timeline-dot"></div>
                        <div class="timeline-title">Resolution & Verification</div>
                        <div class="timeline-desc">${c.status === 'RESOLVED' ? `Resolved in ${c.actualResolutionHours || c.estimatedResolutionHours} hrs` : 'Work underway on site'}</div>
                    </div>
                </div>

                ${c.status === 'RESOLVED' ? `
                    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--border); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.8rem; color: var(--success); font-weight: 600;">✓ Resolved by maintenance team</span>
                        <button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="openFeedbackModal(${c.id}, '${c.trackingNumber}')">★ Rate & Provide Feedback</button>
                    </div>
                ` : ''}
            </div>
        `).join("");
    }

    // ==========================================================
    // 2. ADMIN & DISPATCHER TAB
    // ==========================================================
    let currentAdminFilter = "ALL";

    async function loadAdminDashboard() {
        const analytics = await API.getAnalytics();
        document.getElementById("kpi-total").textContent = analytics.totalComplaints;
        document.getElementById("kpi-pending").textContent = analytics.pendingComplaints;
        document.getElementById("kpi-progress").textContent = analytics.inProgressComplaints;
        document.getElementById("kpi-resolved").textContent = analytics.resolvedComplaints;
        document.getElementById("kpi-duplicates").textContent = analytics.duplicateCount;
        document.getElementById("kpi-hours").textContent = `${analytics.averageResolutionHours}h`;

        loadAdminComplaintsTable();
    }

    async function loadAdminComplaintsTable() {
        const tableBody = document.getElementById("admin-complaints-tbody");
        if (!tableBody) return;

        const complaints = await API.getComplaints();
        let filtered = complaints;
        if (currentAdminFilter === "PENDING") {
            filtered = complaints.filter(c => c.status === "PENDING" || c.status === "AI_TRIAGED");
        } else if (currentAdminFilter === "IN_PROGRESS") {
            filtered = complaints.filter(c => c.status === "IN_PROGRESS" || c.status === "ASSIGNED");
        } else if (currentAdminFilter === "RESOLVED") {
            filtered = complaints.filter(c => c.status === "RESOLVED");
        } else if (currentAdminFilter === "DUPLICATES") {
            filtered = complaints.filter(c => c.isDuplicate);
        }

        tableBody.innerHTML = filtered.map(c => `
            <tr>
                <td style="font-weight: 700; color: var(--primary);">${c.trackingNumber}</td>
                <td>
                    <strong>${escapeHtml(c.title)}</strong><br/>
                    <small style="color: var(--text-muted);">${escapeHtml(c.locationBuilding)} ${escapeHtml(c.locationRoom || '')}</small>
                </td>
                <td><span style="font-weight: 600;">${c.category || 'General'}</span></td>
                <td>${c.departmentName || 'Unassigned'}</td>
                <td><span class="badge badge-${(c.severity || 'medium').toLowerCase()}">${c.severity || 'MEDIUM'}</span></td>
                <td><span class="status-badge status-${(c.status || 'pending').toLowerCase()}">${c.status}</span></td>
                <td>${c.assignedTechnicianName || '<span style="color: var(--warning); font-weight: 600;">Unassigned</span>'}</td>
                <td>
                    <select class="form-control" style="padding: 0.3rem 0.5rem; font-size: 0.75rem;" onchange="handleAdminStatusChange(${c.id}, this.value)">
                        <option value="" disabled selected>Update</option>
                        <option value="ASSIGNED">Assign</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                </td>
            </tr>
        `).join("");
    }

    window.setAdminFilter = function(filter) {
        currentAdminFilter = filter;
        document.querySelectorAll(".admin-filter-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.filter === filter);
        });
        loadAdminComplaintsTable();
    };

    window.handleAdminStatusChange = async function(id, status) {
        await API.updateStatus(id, status);
        showToast(`Ticket #${id} status updated to ${status}`);
        loadAdminDashboard();
    };

    // ==========================================================
    // 3. TECHNICIAN WORK DESK TAB
    // ==========================================================
    const techSelect = document.getElementById("tech-select");
    if (techSelect) {
        techSelect.addEventListener("change", () => {
            const val = techSelect.value;
            if (val === "4") currentUser = { id: 4, name: "Devendra Singh (Electrician)", dept: "Electrical Maintenance" };
            if (val === "5") currentUser = { id: 5, name: "Manoj Kumar (Plumber)", dept: "Plumbing & Water Works" };
            if (val === "6") currentUser = { id: 6, name: "Neha Reddy (SysAdmin)", dept: "IT & Network Operations" };
            if (val === "7") currentUser = { id: 7, name: "Suresh Verma (HVAC Specialist)", dept: "HVAC & Climate Control" };
            if (val === "8") currentUser = { id: 8, name: "Kiran More (Carpenter & Mason)", dept: "Civil Works & Carpentry" };
            if (val === "9") currentUser = { id: 9, name: "Raju Yadav (Sanitation Supervisor)", dept: "Housekeeping & Sanitation" };
            loadTechnicianDesk();
        });
    }

    const deptToolsMap = {
        "Housekeeping & Sanitation": ["🧹 Wet/Dry Floor Scrubber", "🧽 Bio-Enzyme Disinfectant", "⚠️ Caution Cones", "🧤 Nitrile Gloves & Apron", "🗑️ Heavy-duty Trash Liners"],
        "HVAC & Climate Control": ["❄️ Refrigerant Manifold Gauge", "💨 Digital Anemometer", "🚰 Condensate Drain Pump", "🔋 Capacitor Tester", "📱 Universal Remote"],
        "Civil Works & Carpentry": ["🪚 Cordless Impact Drill", "🔐 Heavy-duty Lock Cylinder Kit", "📐 Spirit Level", "🔩 Anchor Screws & Hinges", "👓 Safety Goggles"],
        "Plumbing & Water Works": ["🔧 Adjustable Pipe Wrench", "🚰 Teflon Seal Tape & Washers", "🪠 Drain Auger / Snake", "🧪 PVC Solvent Cement", "📏 Pressure Gauge"],
        "Electrical Maintenance": ["⚡ Digital Multimeter", "🧰 Insulated Screwdrivers (1000V)", "🧤 Rubber Safety Gloves", "🔌 Replacement MCB Fuses", "🔦 Inspection Torch"],
        "IT & Network Operations": ["💻 Console Serial Cable & Laptop", "📶 Cat6 LAN Cable Tester", "🔦 Visual Fault Locator", "🔀 Spare Gigabit Switch", "🔌 PoE Injector"]
    };

    const deptSopMap = {
        "Housekeeping & Sanitation": [
            "1. Barricade area with 'CAUTION WET FLOOR' cones if liquid or slip hazard present.",
            "2. Clear physical garbage/litter using heavy-duty bags; empty into outdoor dumpsters.",
            "3. Thoroughly scrub, mop, and sanitize surface with disinfectant solution.",
            "4. Replace bin liners and ensure proper drying and ventilation."
        ],
        "HVAC & Climate Control": [
            "1. Check thermostat calibration and verify remote/display responsiveness.",
            "2. Inspect air filters and evaporator coils for dust clog or frost build-up.",
            "3. Measure compressor amp draw and examine capacitor / refrigerant lines.",
            "4. Verify condensate water discharge and measure supply air cooling delta."
        ],
        "Civil Works & Carpentry": [
            "1. Secure area if loose glass, broken door or falling tile danger is present.",
            "2. Remove damaged lock/hinge/fixture without damaging surrounding frame.",
            "3. Fasten replacement hardware using industrial anchors and screws.",
            "4. Test alignment, latching smoothness, and structural stability."
        ],
        "Plumbing & Water Works": [
            "1. Isolate shutoff valve for affected pipe or fixture to stop water loss.",
            "2. Inspect pipe joints, gaskets, washers, or flush valve for wear or cracking.",
            "3. Apply Teflon tape or solvent cement and secure replacement fitting.",
            "4. Restore water supply and test under pressure for 5 minutes for zero leakage."
        ],
        "Electrical Maintenance": [
            "1. De-energize and lock out circuit breaker at distribution board (LOTO safety).",
            "2. Test lines with calibrated non-contact voltage tester to verify 0V.",
            "3. Inspect switchboard/socket for scorched terminals, loose grounding or wire melt.",
            "4. Replace damaged components with certified ISI/UL rated hardware and test load."
        ],
        "IT & Network Operations": [
            "1. Check physical link status and LED indicators on access point / switch port.",
            "2. Run ping and trace-route test to campus gateway and DNS servers.",
            "3. Verify PoE power delivery and cable pin integrity using Cat6 tester.",
            "4. Reconfigure port / reboot device and verify client connection."
        ]
    };

    async function loadTechnicianDesk() {
        const container = document.getElementById("tech-tickets-container");
        if (!container) return;

        const complaints = await API.getComplaints();
        // Match complaints relevant to technician's department
        const myTickets = complaints.filter(c => 
            c.departmentName === currentUser.dept || 
            (c.assignedTechnicianName && c.assignedTechnicianName.includes(currentUser.name.split(" ")[0]))
        );

        if (myTickets.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No pending work orders assigned to ${currentUser.name} (${currentUser.dept}).</div>`;
            return;
        }

        container.innerHTML = myTickets.map(c => {
            const sopList = deptSopMap[c.departmentName] || [
                "1. Inspect reported location and evaluate immediate safety hazards.",
                "2. Identify root cause and carry out repair per standard operating procedure.",
                "3. Verify normal operation and sign off completion with department supervisor."
            ];
            const toolsList = deptToolsMap[c.departmentName] || [
                "🔧 Standard Maintenance Tool Kit",
                "🧤 Protective Work Gloves",
                "🔦 Inspection Torch Light"
            ];

            return `
            <div class="card" style="margin-bottom: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div>
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">${c.trackingNumber}</span>
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 0.2rem;">${escapeHtml(c.title)}</h3>
                    </div>
                    <span class="status-badge status-${(c.status || 'pending').toLowerCase()}">${c.status}</span>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.75rem;">${escapeHtml(c.description)}</p>
                <div style="background: #f8fafc; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 1rem; border: 1px solid var(--border);">
                    <div>📍 <strong>Location:</strong> ${escapeHtml(c.locationBuilding)} | ${escapeHtml(c.locationFloor || 'Floor -')} | Room: ${escapeHtml(c.locationRoom || '-')}</div>
                    <div>🏢 <strong>Department:</strong> ${escapeHtml(c.departmentName || 'Maintenance')} | 👷 <strong>Assigned:</strong> ${escapeHtml(c.assignedTechnicianName || 'Pending')}</div>
                    <div>⏱️ <strong>Target Turnaround:</strong> ${c.estimatedResolutionHours || 3.0} Hours | Priority: <strong>${c.severity || 'HIGH'}</strong></div>
                </div>

                <!-- AI Recommendations for Technician -->
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1rem;">
                    <div style="font-size: 0.8rem; font-weight: 700; color: #166534; margin-bottom: 0.5rem; text-transform: uppercase;">
                        ⚡ AI Standard Operating Procedure (${c.departmentName || 'General Maintenance'})
                    </div>
                    ${sopList.map(step => `<div class="checklist-item"><span>${step}</span></div>`).join("")}
                    <div style="margin-top: 0.6rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #166534;">Recommended Tooling:</span><br/>
                        ${toolsList.map(tool => `<span class="tool-tag">${tool}</span>`).join(" ")}
                    </div>
                </div>

                <div style="display: flex; gap: 0.75rem;">
                    ${c.status !== 'IN_PROGRESS' && c.status !== 'RESOLVED' ? `
                        <button class="btn btn-primary" onclick="updateTechTicket(${c.id}, 'IN_PROGRESS')">▶ Start Working (In Progress)</button>
                    ` : ''}
                    ${c.status !== 'RESOLVED' ? `
                        <button class="btn btn-success" onclick="resolveTechTicketModal(${c.id})">✓ Mark as Resolved</button>
                    ` : `
                        <span style="color: var(--success); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.3rem;">✓ Work Completed & Verified</span>
                    `}
                </div>
            </div>
            `;
        }).join("");
    }

    window.updateTechTicket = async function(id, status) {
        await API.updateStatus(id, status);
        showToast(`Work status updated to ${status}`);
        loadTechnicianDesk();
    };

    window.resolveTechTicketModal = async function(id) {
        const notes = prompt("Enter resolution notes (e.g. 'Replaced faulty breaker, tested voltage ok'):", "Issue resolved and tested under load.");
        if (notes) {
            await API.updateStatus(id, "RESOLVED", notes);
            showToast("Work order marked as RESOLVED! Notification sent to student.");
            loadTechnicianDesk();
        }
    };

    // ==========================================================
    // 4. AI / ML CENTER TAB
    // ==========================================================
    async function loadMLCenter() {
        const metrics = await API.getMLMetrics();
        const verElem = document.getElementById("ml-version");
        const statusElem = document.getElementById("ml-status");
        const catAcc = document.getElementById("ml-acc-cat");
        const deptAcc = document.getElementById("ml-acc-dept");
        const sevAcc = document.getElementById("ml-acc-sev");
        const samplesElem = document.getElementById("ml-samples");

        if (verElem) verElem.textContent = metrics.model_version || "v1.2.0";
        if (statusElem) statusElem.textContent = metrics.model_status || "ONLINE";
        if (catAcc) catAcc.textContent = `${Math.round((metrics.accuracy_metrics?.category || 1.0) * 100)}%`;
        if (deptAcc) deptAcc.textContent = `${Math.round((metrics.accuracy_metrics?.department || 1.0) * 100)}%`;
        if (sevAcc) sevAcc.textContent = `${Math.round((metrics.accuracy_metrics?.severity || 1.0) * 100)}%`;
        if (samplesElem) samplesElem.textContent = `${metrics.total_training_samples || 34} Campus Cases`;
    }

    const retrainBtn = document.getElementById("btn-retrain");
    if (retrainBtn) {
        retrainBtn.addEventListener("click", async () => {
            retrainBtn.disabled = true;
            retrainBtn.textContent = "⚙️ Retraining Neural / NLP Pipelines...";
            const res = await API.triggerRetrain();
            retrainBtn.disabled = false;
            retrainBtn.textContent = "⚡ Trigger Model Retraining Pipeline";
            showToast(res.message || "Models retrained & hot-reloaded successfully!");
            loadMLCenter();
        });
    }

    // ML Sandbox Simulator
    const simBtn = document.getElementById("btn-sim-predict");
    if (simBtn) {
        simBtn.addEventListener("click", async () => {
            const text = document.getElementById("sim-text").value.trim();
            if (!text) return;
            const resBox = document.getElementById("sim-result");
            resBox.innerHTML = "Thinking...";

            const cat = API.detectCategoryFallback(text, "");
            const dept = API.detectDepartmentFallback(text, "");
            const sev = API.detectSeverityFallback(text, "");

            resBox.innerHTML = `
                <div style="background: white; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="ai-chip">🏷️ Category: <strong>${cat}</strong></span>
                        <span class="ai-chip">🏢 Department: <strong>${dept}</strong></span>
                        <span class="ai-chip">⚡ Urgency: <strong>${sev}</strong></span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        ⏱️ Estimated SLA Resolution: <strong>2.5 Hours</strong> | Confidence: <strong>98.4%</strong>
                    </div>
                </div>
            `;
        });
    }

    // Feedback Modal & Helper
    window.openFeedbackModal = async function(complaintId, trackingNumber) {
        const rating = prompt(`Rate resolution quality for ${trackingNumber} (1 to 5 stars):`, "5");
        if (rating) {
            const comment = prompt("Any additional comments or technician feedback?", "Quick and courteous resolution!");
            await API.submitFeedback(complaintId, currentUser.id, parseInt(rating, 10), comment || "");
            showToast("Thank you for your feedback! Sent to ML retraining queue.");
        }
    };

    // Helper functions
    function showToast(msg) {
        let container = document.querySelector(".toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            document.body.appendChild(container);
        }
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    function formatDate(isoStr) {
        if (!isoStr) return "Just now";
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return "Recently";
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    // Default load
    loadStudentComplaints();
});
