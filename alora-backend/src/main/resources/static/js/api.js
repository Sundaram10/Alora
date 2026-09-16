const API = (function() {
    const BACKEND_URL = "http://127.0.0.1:8080";
    const ML_URL = "http://127.0.0.1:8001";

    let useMockFallback = false;

    // In-memory fallback dataset for standalone preview
    let mockComplaints = [
        {
            id: 1,
            trackingNumber: "ALR-2026-0001",
            userId: 2,
            userName: "Aarav Patel (Student)",
            title: "Main corridor lights flickering and sparking",
            description: "The tube light near room 302 in Hostel Block A is flickering and producing a humming noise with occasional sparks.",
            locationBuilding: "Hostel Block A",
            locationFloor: "3rd Floor",
            locationRoom: "Corridor near 302",
            category: "Electrical",
            departmentName: "Electrical Maintenance",
            severity: "HIGH",
            status: "IN_PROGRESS",
            assignedTechnicianName: "Devendra Singh (Electrician)",
            estimatedResolutionHours: 4.0,
            actualResolutionHours: null,
            isDuplicate: false,
            createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
        },
        {
            id: 2,
            trackingNumber: "ALR-2026-0002",
            userId: 3,
            userName: "Prof. Sangeeta Sen",
            title: "Water pipeline leaking under washbasin",
            description: "Washbasin pipeline cracked in Faculty Restroom 2nd floor, water leaking continuously onto tile floor.",
            locationBuilding: "Science & Technology Block",
            locationFloor: "2nd Floor",
            locationRoom: "Faculty Restroom 204",
            category: "Plumbing",
            departmentName: "Plumbing & Water Works",
            severity: "HIGH",
            status: "ASSIGNED",
            assignedTechnicianName: "Manoj Kumar (Plumber)",
            estimatedResolutionHours: 3.5,
            actualResolutionHours: null,
            isDuplicate: false,
            createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
        },
        {
            id: 3,
            trackingNumber: "ALR-2026-0003",
            userId: 2,
            userName: "Aarav Patel (Student)",
            title: "Wi-Fi access point showing red error light",
            description: "Hostel Block A 3rd floor Wi-Fi access point AP-09 is unreachable. SSIDs not visible.",
            locationBuilding: "Hostel Block A",
            locationFloor: "3rd Floor",
            locationRoom: "Wing B Study Area",
            category: "IT & Network",
            departmentName: "IT & Network Operations",
            severity: "MEDIUM",
            status: "PENDING",
            assignedTechnicianName: null,
            estimatedResolutionHours: 2.5,
            actualResolutionHours: null,
            isDuplicate: false,
            createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
        },
        {
            id: 4,
            trackingNumber: "ALR-2026-0004",
            userId: 3,
            userName: "Prof. Sangeeta Sen",
            title: "Projector HDMI port damaged in Seminar Hall 1",
            description: "Seminar Hall 1 projector is not accepting HDMI signal from podium laptop.",
            locationBuilding: "Academic Complex",
            locationFloor: "Ground Floor",
            locationRoom: "Seminar Hall 1",
            category: "IT & Network",
            departmentName: "IT & Network Operations",
            severity: "MEDIUM",
            status: "RESOLVED",
            assignedTechnicianName: "Neha Reddy (SysAdmin)",
            estimatedResolutionHours: 2.0,
            actualResolutionHours: 1.8,
            isDuplicate: false,
            createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
            resolvedAt: new Date(Date.now() - 22 * 3600000).toISOString()
        }
    ];

    async function checkHealth() {
        let backendOk = false;
        let mlOk = false;
        try {
            const res = await fetch(`${BACKEND_URL}/api/departments`, { method: 'GET', signal: AbortSignal.timeout(1500) });
            backendOk = res.ok;
        } catch (e) {
            backendOk = false;
        }

        try {
            const res = await fetch(`${ML_URL}/api/ml/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
            mlOk = res.ok;
        } catch (e) {
            mlOk = false;
        }

        return { backend: backendOk, ml: mlOk };
    }

    async function getComplaints(filter = {}) {
        try {
            const params = new URLSearchParams(filter);
            const res = await fetch(`${BACKEND_URL}/api/complaints?${params.toString()}`, { signal: AbortSignal.timeout(2000) });
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            // fallback
        }
        return mockComplaints;
    }

    async function submitComplaint(payload) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/complaints`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(3000)
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.warn("Backend unavailable, using simulated AI triage in browser:", e);
        }

        // Local simulation fallback
        const cat = detectCategoryFallback(payload.title, payload.description);
        let dept = detectDepartmentFallback(payload.title, payload.description);
        const deptIdMap = {
            1: "Electrical Maintenance",
            2: "Plumbing & Water Works",
            3: "IT & Network Operations",
            4: "HVAC & Climate Control",
            5: "Civil Works & Carpentry",
            6: "Housekeeping & Sanitation"
        };
        if (payload.departmentId && deptIdMap[payload.departmentId]) {
            dept = deptIdMap[payload.departmentId];
        }

        const techMap = {
            "Electrical Maintenance": "Devendra Singh (Electrician)",
            "Plumbing & Water Works": "Manoj Kumar (Plumber)",
            "IT & Network Operations": "Neha Reddy (SysAdmin)",
            "HVAC & Climate Control": "Suresh Verma (HVAC Specialist)",
            "Civil Works & Carpentry": "Kiran More (Carpenter & Mason)",
            "Housekeeping & Sanitation": "Raju Yadav (Sanitation Supervisor)"
        };

        const mockNew = {
            id: mockComplaints.length + 1,
            trackingNumber: `ALR-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
            userId: payload.userId || 2,
            userName: "Aarav Patel (Student)",
            title: payload.title,
            description: payload.description,
            locationBuilding: payload.locationBuilding,
            locationFloor: payload.locationFloor,
            locationRoom: payload.locationRoom,
            category: cat,
            departmentName: dept,
            severity: detectSeverityFallback(payload.title, payload.description),
            status: "ASSIGNED",
            assignedTechnicianName: techMap[dept] || "Devendra Singh (Electrician)",
            estimatedResolutionHours: 3.5,
            actualResolutionHours: null,
            isDuplicate: false,
            createdAt: new Date().toISOString()
        };
        mockComplaints.unshift(mockNew);
        return mockNew;
    }

    async function checkDuplicateLive(title, description, locationBuilding, locationFloor, locationRoom) {
        if (!title && !description) return { is_duplicate: false };

        // 1. Try Python ML service directly
        try {
            const res = await fetch(`${ML_URL}/api/ml/check-duplicate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    location_building: locationBuilding,
                    location_floor: locationFloor,
                    location_room: locationRoom,
                    threshold: 0.55
                }),
                signal: AbortSignal.timeout(1200)
            });
            if (res.ok) return await res.json();
        } catch (e) {
            // ML service unreachable, fallback to client matching
        }

        // Client side semantic & location overlap matching
        const text = `${title} ${description}`.toLowerCase();
        const bldg = (locationBuilding || "").toLowerCase();

        for (const item of mockComplaints) {
            const itemText = `${item.title} ${item.description}`.toLowerCase();
            const itemBldg = (item.locationBuilding || "").toLowerCase();

            // Word overlap
            const words = text.split(/\s+/).filter(w => w.length > 3);
            const matches = words.filter(w => itemText.includes(w));
            const overlapRatio = words.length > 0 ? (matches.length / words.length) : 0;

            const isSameBldg = bldg && itemBldg && (bldg.includes(itemBldg) || itemBldg.includes(bldg));
            const score = Math.min(1.0, overlapRatio + (isSameBldg ? 0.25 : 0));

            if (score >= 0.50) {
                return {
                    is_duplicate: true,
                    highest_similarity: Math.round(score * 100) / 100,
                    matched_complaint: {
                        tracking_number: item.trackingNumber,
                        title: item.title,
                        location: `${item.locationBuilding} (${item.locationRoom || ''})`,
                        similarity_score: Math.round(score * 100) / 100,
                        status: item.status
                    }
                };
            }
        }

        return { is_duplicate: false, highest_similarity: 0.0 };
    }

    async function updateStatus(id, status, notes = "", technicianId = null) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/complaints/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    resolutionNotes: notes,
                    assignedTechnicianId: technicianId
                }),
                signal: AbortSignal.timeout(2000)
            });
            if (res.ok) return await res.json();
        } catch (e) {}

        const item = mockComplaints.find(c => c.id === id);
        if (item) {
            item.status = status;
            if (notes) item.resolutionNotes = notes;
            if (status === "RESOLVED") {
                item.resolvedAt = new Date().toISOString();
                item.actualResolutionHours = 2.0;
            }
            return item;
        }
    }

    async function submitFeedback(complaintId, userId, rating, comments) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    complaintId,
                    userId,
                    rating,
                    comments,
                    satisfactionLevel: rating >= 4 ? "VERY_SATISFIED" : (rating === 3 ? "NEUTRAL" : "DISSATISFIED")
                }),
                signal: AbortSignal.timeout(2000)
            });
            if (res.ok) return await res.json();
        } catch (e) {}
        return { success: true };
    }

    async function getAnalytics() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/analytics/dashboard`, { signal: AbortSignal.timeout(2000) });
            if (res.ok) return await res.json();
        } catch (e) {}

        // Mock Analytics
        return {
            totalComplaints: mockComplaints.length,
            pendingComplaints: mockComplaints.filter(c => c.status === "PENDING").length,
            inProgressComplaints: mockComplaints.filter(c => c.status === "IN_PROGRESS" || c.status === "ASSIGNED").length,
            resolvedComplaints: mockComplaints.filter(c => c.status === "RESOLVED").length,
            duplicateCount: mockComplaints.filter(c => c.isDuplicate).length,
            averageResolutionHours: 2.8,
            averageRating: 4.9,
            complaintsByCategory: {
                "Electrical": 1,
                "Plumbing": 1,
                "IT & Network": 2
            },
            complaintsByDepartment: {
                "Electrical Maintenance": 1,
                "Plumbing & Water Works": 1,
                "IT & Network Operations": 2
            }
        };
    }

    async function getMLMetrics() {
        try {
            const res = await fetch(`${ML_URL}/api/ml/metrics`, { signal: AbortSignal.timeout(2000) });
            if (res.ok) return await res.json();
        } catch (e) {}

        return {
            model_status: "READY",
            model_version: "v1.2.0-smart-campus",
            trained_at: new Date().toISOString(),
            categories: ["Electrical", "Plumbing", "IT & Network", "HVAC", "Civil & Carpentry", "Sanitation"],
            departments: ["Electrical Maintenance", "Plumbing & Water Works", "IT & Network Operations", "HVAC & Climate Control", "Civil Works & Carpentry", "Housekeeping & Sanitation"],
            severities: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            total_training_samples: 34,
            accuracy_metrics: {
                category: 1.0,
                department: 1.0,
                severity: 1.0
            }
        };
    }

    async function triggerRetrain() {
        try {
            const res = await fetch(`${ML_URL}/api/ml/retrain`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
                signal: AbortSignal.timeout(5000)
            });
            if (res.ok) return await res.json();
        } catch (e) {}

        return {
            status: "SUCCESS",
            message: "Simulated hot retraining complete. Model weights updated.",
            samples_trained: 35,
            category_accuracy: 1.0,
            department_accuracy: 1.0,
            severity_accuracy: 1.0,
            trained_at: new Date().toISOString()
        };
    }

    function detectCategoryFallback(title, desc) {
        const text = `${title} ${desc}`.toLowerCase();
        if (text.includes("dustbin") || text.includes("trash") || text.includes("garbage") || text.includes("waste") || text.includes("clean") || text.includes("mop") || text.includes("sweep") || text.includes("odor") || text.includes("smell") || text.includes("litter") || text.includes("stain") || text.includes("pest") || text.includes("hygiene") || text.includes("disinfection") || text.includes("sanitary")) return "Sanitation";
        if (text.includes("spark") || text.includes("light") || text.includes("fan") || text.includes("mcb") || text.includes("power") || text.includes("socket") || text.includes("switch") || text.includes("electric") || text.includes("wiring") || text.includes("outage")) return "Electrical";
        if (text.includes("leak") || text.includes("water") || text.includes("pipe") || text.includes("tap") || text.includes("flush") || text.includes("drain") || text.includes("sink") || text.includes("basin") || text.includes("cooler") || text.includes("shower")) return "Plumbing";
        if (text.includes("wifi") || text.includes("wi-fi") || text.includes("internet") || text.includes("projector") || text.includes("lan") || text.includes("router") || text.includes("network") || text.includes("dns") || text.includes("portal") || text.includes("ethernet")) return "IT & Network";
        if (/\bac\b/.test(text) || text.includes("cooling") || text.includes("chiller") || text.includes("thermostat") || text.includes("compressor") || text.includes("air conditioner")) return "HVAC";
        if (text.includes("door") || text.includes("lock") || text.includes("bench") || text.includes("chair") || text.includes("desk") || text.includes("window") || text.includes("glass") || text.includes("tile") || text.includes("table") || text.includes("hinge") || text.includes("furniture") || text.includes("whiteboard")) return "Civil & Carpentry";
        return "Sanitation";
    }

    function detectDepartmentFallback(title, desc) {
        const cat = detectCategoryFallback(title, desc);
        const map = {
            "Electrical": "Electrical Maintenance",
            "Plumbing": "Plumbing & Water Works",
            "IT & Network": "IT & Network Operations",
            "HVAC": "HVAC & Climate Control",
            "Civil & Carpentry": "Civil Works & Carpentry",
            "Sanitation": "Housekeeping & Sanitation"
        };
        return map[cat] || "Civil Works & Carpentry";
    }

    function detectSeverityFallback(title, desc) {
        const text = `${title} ${desc}`.toLowerCase();
        if (text.includes("spark") || text.includes("fire") || text.includes("burst") || text.includes("burn")) return "CRITICAL";
        if (text.includes("leak") || text.includes("down") || text.includes("dark")) return "HIGH";
        return "MEDIUM";
    }

    return {
        checkHealth,
        getComplaints,
        submitComplaint,
        checkDuplicateLive,
        updateStatus,
        submitFeedback,
        getAnalytics,
        getMLMetrics,
        triggerRetrain,
        detectCategoryFallback,
        detectDepartmentFallback,
        detectSeverityFallback
    };
})();
