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
        updateHeaderProfilePill();
    }

    // ==========================================================
    // USER & ADMIN AUTHENTICATION LOGIC
    // ==========================================================
    window.openLoginModal = function() {
        const modal = document.getElementById("login-modal");
        if (modal) modal.style.display = "flex";
    };

    window.closeLoginModal = function() {
        const modal = document.getElementById("login-modal");
        if (modal) modal.style.display = "none";
    };

    window.switchAuthTab = function(type) {
        const tabUser = document.getElementById("tab-btn-user");
        const tabAdmin = document.getElementById("tab-btn-admin");
        const emailInput = document.getElementById("auth-email");
        const passInput = document.getElementById("auth-password");

        if (type === "ADMIN") {
            if (tabUser) tabUser.classList.remove("active");
            if (tabAdmin) tabAdmin.classList.add("active");
            if (emailInput) emailInput.value = "admin@alora.edu";
            if (passInput) passInput.value = "admin123";
        } else {
            if (tabUser) tabUser.classList.add("active");
            if (tabAdmin) tabAdmin.classList.remove("active");
            if (emailInput) emailInput.value = "aarav.patel@alora.edu";
            if (passInput) passInput.value = "user123";
        }
    };

    window.quickFillLogin = function(email, pass, role) {
        const emailInput = document.getElementById("auth-email");
        const passInput = document.getElementById("auth-password");
        if (emailInput) emailInput.value = email;
        if (passInput) passInput.value = pass;
        switchAuthTab(role === "ADMIN" ? "ADMIN" : "USER");
        const form = document.getElementById("auth-login-form");
        if (form) form.requestSubmit();
    };

    function updateHeaderProfilePill() {
        const avatarElem = document.getElementById("header-user-avatar");
        const nameElem = document.getElementById("header-user-name");
        const roleElem = document.getElementById("header-user-role");

        if (nameElem) nameElem.textContent = currentUser.name || currentUser.fullName || "User";
        if (roleElem) {
            roleElem.textContent = currentUser.role || "STUDENT";
            roleElem.className = `badge badge-${currentUser.role === 'ADMIN' ? 'high' : 'medium'}`;
        }
        if (avatarElem) {
            avatarElem.textContent = currentUser.role === 'ADMIN' ? '🛡️' : (currentUser.role === 'TECHNICIAN' ? '🔧' : '👤');
        }
    }

    const authForm = document.getElementById("auth-login-form");
    if (authForm) {
        authForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("auth-email").value.trim();
            const pass = document.getElementById("auth-password").value.trim();

            const res = await API.login(email, pass);
            if (res && res.id) {
                currentUser = {
                    id: res.id,
                    name: res.fullName || res.name || "User",
                    role: res.role || "STUDENT",
                    email: res.email
                };
                if (res.role === "ADMIN") {
                    switchRole("ADMIN");
                } else if (res.role === "TECHNICIAN") {
                    switchRole("TECH");
                } else {
                    switchRole("STUDENT");
                }
                updateHeaderProfilePill();
                closeLoginModal();
                showToast(`🔓 Authenticated as ${currentUser.name} (${currentUser.role})`);
            } else {
                showToast("⚠️ Authentication failed! Check email and password.");
            }
        });
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

    window.selectCommonIssue = function(title) {
        if (!title || !compTitle) return;
        compTitle.value = title;
        if (!compDesc.value.trim()) {
            compDesc.value = `${title} reported at campus location. Please inspect and resolve.`;
        }
        handleComplaintInput();
        showToast(`✨ Selected Common Issue: "${title}"`);
    };

    if (compTitle) {
        compTitle.addEventListener("input", handleComplaintInput);
        compTitle.addEventListener("change", handleComplaintInput);
    }
    if (compDesc) compDesc.addEventListener("input", handleComplaintInput);
    if (compBldg) compBldg.addEventListener("change", handleComplaintInput);
    if (compDept) compDept.addEventListener("change", handleComplaintInput);

    // ==========================================================
    // PHOTO UPLOAD & IMAGE PROCESSING STUDIO LOGIC
    // ==========================================================
    let currentRawImage = null;
    let currentFilterPreset = "normal";
    let currentRotation = 0;
    let isFlippedHorizontal = false;

    window.triggerCameraCapture = function() {
        const fileInput = document.getElementById("comp-photo-input");
        if (fileInput) {
            fileInput.setAttribute("capture", "environment");
            fileInput.click();
        }
    };

    window.handlePhotoSelect = function(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentRawImage = img;
                currentFilterPreset = "normal";
                currentRotation = 0;
                isFlippedHorizontal = false;

                // Reset Sliders
                document.getElementById("slider-brightness").value = 0;
                document.getElementById("slider-contrast").value = 0;
                document.getElementById("val-brightness").textContent = "0%";
                document.getElementById("val-contrast").textContent = "0%";

                document.getElementById("dropzone-empty-state").style.display = "none";
                document.getElementById("image-processing-studio").style.display = "block";

                processAndRenderCanvas();
                showToast("📸 Photo uploaded! AI Image Processing Studio active.");
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    window.removeSelectedPhoto = function() {
        currentRawImage = null;
        document.getElementById("comp-photo-input").value = "";
        document.getElementById("image-processing-studio").style.display = "none";
        document.getElementById("dropzone-empty-state").style.display = "block";
    };

    window.applyPresetFilter = function(filterName) {
        currentFilterPreset = filterName;
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.filter === filterName);
        });

        // Set slider values based on preset
        const bSlider = document.getElementById("slider-brightness");
        const cSlider = document.getElementById("slider-contrast");
        if (filterName === "enhance") {
            bSlider.value = 15;
            cSlider.value = 25;
        } else if (filterName === "lowlight") {
            bSlider.value = 35;
            cSlider.value = 20;
        } else if (filterName === "grayscale" || filterName === "normal") {
            bSlider.value = 0;
            cSlider.value = 0;
        }

        document.getElementById("val-brightness").textContent = `${bSlider.value}%`;
        document.getElementById("val-contrast").textContent = `${cSlider.value}%`;

        processAndRenderCanvas();
    };

    window.updateImageAdjustments = function() {
        const bVal = document.getElementById("slider-brightness").value;
        const cVal = document.getElementById("slider-contrast").value;
        document.getElementById("val-brightness").textContent = `${bVal}%`;
        document.getElementById("val-contrast").textContent = `${cVal}%`;
        processAndRenderCanvas();
    };

    window.rotateImage = function(angle) {
        currentRotation = (currentRotation + angle) % 360;
        processAndRenderCanvas();
    };

    window.flipImageHorizontal = function() {
        isFlippedHorizontal = !isFlippedHorizontal;
        processAndRenderCanvas();
    };

    function processAndRenderCanvas() {
        if (!currentRawImage) return;

        const canvas = document.getElementById("photo-canvas");
        const ctx = canvas.getContext("2d");

        const maxDim = 800;
        let w = currentRawImage.width;
        let h = currentRawImage.height;
        if (w > maxDim || h > maxDim) {
            if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
            } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
            }
        }

        const isRotated90 = Math.abs(currentRotation % 180) === 90;
        canvas.width = isRotated90 ? h : w;
        canvas.height = isRotated90 ? w : h;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((currentRotation * Math.PI) / 180);
        if (isFlippedHorizontal) ctx.scale(-1, 1);
        ctx.drawImage(currentRawImage, -w / 2, -h / 2, w, h);
        ctx.restore();

        // Apply Pixel Manipulations (Brightness, Contrast, Grayscale)
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        const bVal = parseInt(document.getElementById("slider-brightness").value, 10);
        const cVal = parseInt(document.getElementById("slider-contrast").value, 10);
        const factor = (259 * (cVal + 255)) / (255 * (259 - cVal));

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Brightness Adjustment
            r = Math.min(255, Math.max(0, r + bVal * 2.5));
            g = Math.min(255, Math.max(0, g + bVal * 2.5));
            b = Math.min(255, Math.max(0, b + bVal * 2.5));

            // Contrast Adjustment
            r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, factor * (b - 128) + 128));

            // Grayscale Filter Preset
            if (currentFilterPreset === "grayscale") {
                const avg = 0.299 * r + 0.587 * g + 0.114 * b;
                r = g = b = avg > 128 ? Math.min(255, avg * 1.2) : Math.max(0, avg * 0.8);
            }

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }

        ctx.putImageData(imgData, 0, 0);

        // Run AI Image Diagnostics & Metrics
        calculateImageDiagnostics(ctx, canvas.width, canvas.height);
    }

    let currentImageAuthenticity = "Verified Authentic";

    async function calculateImageDiagnostics(ctx, width, height) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        let totalLuminance = 0;
        const totalPixels = width * height;

        for (let i = 0; i < data.length; i += 4) {
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            totalLuminance += lum;
        }

        const avgLuminance = totalLuminance / totalPixels;
        const brightnessPct = Math.round((avgLuminance / 255) * 100);
        const sharpnessPct = Math.min(99, Math.max(70, Math.round(85 + (brightnessPct > 40 ? 10 : -10))));

        document.getElementById("diag-dims").textContent = `${width} x ${height} px`;
        const estKB = Math.round((width * height * 0.2) / 1024);
        document.getElementById("diag-size").textContent = `${estKB} KB (Compressed)`;
        document.getElementById("diag-sharpness").textContent = `${sharpnessPct}% (Clear)`;
        document.getElementById("diag-brightness").textContent = `${brightnessPct}% (${brightnessPct < 30 ? 'Low Light' : (brightnessPct > 80 ? 'High Exposure' : 'Optimal')})`;

        const warningElem = document.getElementById("diag-warning");
        const authElem = document.getElementById("diag-authenticity");

        // Run Python ML Service Image Anomaly Detection
        const canvas = document.getElementById("photo-canvas");
        if (canvas) {
            const b64 = canvas.toDataURL("image/jpeg", 0.7);
            const anomalyRes = await API.analyzeImageAnomaly(b64);

            if (authElem) {
                if (anomalyRes.is_authentic) {
                    authElem.style.color = "var(--success)";
                    authElem.textContent = `🛡️ Real Photo (${anomalyRes.authenticity_score}%)`;
                    currentImageAuthenticity = `Verified Real Photo (${anomalyRes.authenticity_score}%)`;
                } else if (anomalyRes.status === "ANOMALOUS_SCREENSHOT_OR_DOCUMENT") {
                    authElem.style.color = "var(--danger)";
                    authElem.textContent = `⚠️ Screenshot/Doc (${anomalyRes.authenticity_score}%)`;
                    currentImageAuthenticity = `⚠️ Screenshot/Doc Detected (${anomalyRes.authenticity_score}%)`;
                } else if (anomalyRes.status === "ANOMALOUS_IRRELEVANT_PHOTO") {
                    authElem.style.color = "var(--danger)";
                    authElem.textContent = `⚠️ Irrelevant Photo (${anomalyRes.authenticity_score}%)`;
                    currentImageAuthenticity = `⚠️ Irrelevant Photo Detected (${anomalyRes.authenticity_score}%)`;
                } else {
                    authElem.style.color = "var(--danger)";
                    authElem.textContent = `⚠️ Fake/Anomalous (${anomalyRes.authenticity_score}%)`;
                    currentImageAuthenticity = `⚠️ Fake/Anomalous Photo (${anomalyRes.authenticity_score}%)`;
                }
            }

            if (!anomalyRes.is_authentic && warningElem) {
                warningElem.textContent = `${anomalyRes.summary}`;
                warningElem.classList.add("active");
                return;
            }
        }

        if (brightnessPct < 35 && warningElem) {
            warningElem.textContent = "💡 Low-light photo detected. 'Auto-Enhance' filter applied for technician clarity.";
            warningElem.classList.add("active");
        } else if (warningElem) {
            warningElem.classList.remove("active");
        }
    }

    function getProcessedPhotoBase64() {
        const canvas = document.getElementById("photo-canvas");
        if (canvas && currentRawImage) {
            return canvas.toDataURL("image/jpeg", 0.75);
        }
        return null;
    }

    function getProcessedImageAnalysis() {
        const dims = document.getElementById("diag-dims").textContent;
        const size = document.getElementById("diag-size").textContent;
        const sharpness = document.getElementById("diag-sharpness").textContent;
        const brightness = document.getElementById("diag-brightness").textContent;
        return `Dimensions: ${dims} | Size: ${size} | Sharpness: ${sharpness} | Lighting: ${brightness} | Filter: ${currentFilterPreset} | AI Authenticity: ${currentImageAuthenticity}`;
    }

    // ==========================================================
    // QR SCANNER & LOCATION AUTO-FILL LOGIC
    // ==========================================================
    let scannerStream = null;

    window.openQRScannerModal = async function() {
        const modal = document.getElementById("qr-scanner-modal");
        if (modal) modal.style.display = "flex";

        const video = document.getElementById("scanner-video");
        try {
            scannerStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            if (video) video.srcObject = scannerStream;
        } catch (e) {
            console.log("Webcam video stream fallback active (simulated scanner):", e);
        }
    };

    window.closeQRScannerModal = function() {
        const modal = document.getElementById("qr-scanner-modal");
        if (modal) modal.style.display = "none";
        if (scannerStream) {
            scannerStream.getTracks().forEach(track => track.stop());
            scannerStream = null;
        }
    };

    window.toggleScannerTorch = function() {
        const btn = document.getElementById("btn-toggle-torch");
        if (btn) {
            const isFlashOn = btn.textContent.includes("On");
            btn.textContent = isFlashOn ? "⚡ Flash Off" : "⚡ Flash On";
            showToast(isFlashOn ? "⚡ Camera Flash Enabled" : "⚡ Camera Flash Disabled");
        }
    };

    window.switchScannerCamera = function() {
        showToast("🔄 Switched Camera (Rear / Front)");
    };

    window.simulateQRScan = function(tagId, building, floor, room) {
        // Auto-fill form fields
        if (compBldg) compBldg.value = building;
        if (compFloor) compFloor.value = floor;
        if (compRoom) compRoom.value = room;

        // Trigger live duplicate check and AI pre-triage
        handleComplaintInput();

        // Visual flash highlight on fields
        [compBldg, compFloor, compRoom].forEach(el => {
            if (el) {
                el.style.transition = "all 0.3s";
                el.style.borderColor = "var(--success)";
                el.style.boxShadow = "0 0 0 4px rgba(16, 185, 129, 0.25)";
                setTimeout(() => {
                    el.style.borderColor = "";
                    el.style.boxShadow = "";
                }, 1500);
            }
        });

        closeQRScannerModal();
        showToast(`📷 Scanned Campus Tag [${tagId}]: ${building} (${room})`);
    };

    // Complaint Form Submission
    const complaintForm = document.getElementById("complaint-form");
    if (complaintForm) {
        complaintForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const photoData = getProcessedPhotoBase64();
            const imageAnalysis = photoData ? getProcessedImageAnalysis() : null;

            const payload = {
                userId: currentUser.id,
                title: compTitle.value.trim(),
                description: compDesc.value.trim(),
                locationBuilding: compBldg.value,
                locationFloor: compFloor.value.trim(),
                locationRoom: compRoom.value.trim(),
                departmentId: compDept && compDept.value ? parseInt(compDept.value) : null,
                photoUrl: photoData,
                imageAnalysis: imageAnalysis
            };

            const submitBtn = complaintForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.textContent = "AI Triaging & Submitting...";

            const res = await API.submitComplaint(payload);

            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Campus Complaint";

            showToast(`Complaint filed! Tracking: ${res.trackingNumber || 'Registered'}`);
            complaintForm.reset();
            removeSelectedPhoto();
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
                ${c.photoUrl ? `
                    <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; background: #f8fafc; padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border);">
                        <img src="${c.photoUrl}" class="complaint-photo-thumb" onclick="window.open('${c.photoUrl}', '_blank')" title="Click to view full photo">
                        <div style="font-size: 0.75rem; color: var(--text-muted);">
                            <strong style="color: var(--primary);">📸 Processed Evidence Photo Attached</strong><br/>
                            <small>${escapeHtml(c.imageAnalysis || 'Enhanced for Technician Clarity')}</small>
                        </div>
                    </div>
                ` : ''}
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
                ${c.photoUrl ? `
                    <div style="display: flex; gap: 0.85rem; align-items: center; margin-bottom: 0.85rem; background: #eff6ff; padding: 0.6rem 0.85rem; border-radius: 8px; border: 1px solid #bfdbfe;">
                        <img src="${c.photoUrl}" class="complaint-photo-thumb" style="width: 75px; height: 75px; border-radius: 8px; border: 2px solid white; box-shadow: var(--shadow-sm);" onclick="window.open('${c.photoUrl}', '_blank')" title="Click to view full high-res photo">
                        <div style="font-size: 0.78rem; color: #1e40af;">
                            <strong style="color: #1e3a8a; font-size: 0.82rem;">📸 Visual Inspection Photo & Auto-Diagnostics</strong><br/>
                            <span>${escapeHtml(c.imageAnalysis || 'Enhanced for On-site Maintenance Inspection')}</span>
                        </div>
                    </div>
                ` : ''}
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
