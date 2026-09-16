from typing import Dict, List, Any

DEPARTMENT_TOOLS = {
    "Electrical Maintenance": [
        "Digital Multimeter / Voltage Tester",
        "Insulated Screwdriver Set (1000V)",
        "Wire Stripper & Crimping Pliers",
        "Replacement MCB Breaker / Fuses",
        "Insulated Safety Gloves & Rubber Mats",
        "Telescopic Extension Ladder"
    ],
    "Plumbing & Water Works": [
        "Adjustable Pipe Wrench & Basin Wrench",
        "Teflon Seal Tape & Rubber Washers",
        "Drain Auger / Snake Plunger",
        "PVC Pipe Cutter & Solvent Cement",
        "Pressure Testing Gauge"
    ],
    "IT & Network Operations": [
        "RJ45 LAN Cable Crimper & Cat6 Tester",
        "Optical Power Meter / VFL Visual Fault Locator",
        "Spare Gigabit Switch & SFP Modules",
        "Console Serial Cable & Laptop",
        "Replacement PoE Injector / Cat6 Patch Cords"
    ],
    "HVAC & Climate Control": [
        "Refrigerant Manifold Gauge Set (R410A/R32)",
        "Digital Anemometer & Airflow Hood",
        "Condensate Drain Cleaning Pump",
        "Capacitor Tester & Fin Comb",
        "Universal AC Remote / Thermostat Controller"
    ],
    "Civil Works & Carpentry": [
        "Cordless Impact Drill & Masonry Bits",
        "Heavy-duty Lock Cylinder Replacement Kit",
        "Spirit Level & Wood Chisel Set",
        "Fast-setting Anchor Bolts & Screws",
        "Safety Goggles & Dust Mask"
    ],
    "Housekeeping & Sanitation": [
        "Industrial Wet/Dry Floor Scrubber",
        "Hospital-grade Disinfectant & Bio-Enzyme Cleaner",
        "Caution Wet Floor Signboards",
        "Mops, Squeegees & Heavy-duty Liners",
        "Protective PPE Apron & Nitrile Gloves"
    ]
}

CATEGORY_ACTIONS = {
    "Electrical": [
        "1. De-energize and lock out circuit breaker at distribution board (LOTO safety).",
        "2. Test lines with calibrated non-contact voltage tester to verify 0V.",
        "3. Inspect switchboard/socket for scorched terminals, loose grounding or wire insulation melt.",
        "4. Replace damaged components with certified ISI/UL fire-retardant hardware.",
        "5. Re-energize circuit, verify nominal voltage (220-240V AC) and load balance."
    ],
    "Plumbing": [
        "1. Turn off isolation shutoff valve for affected pipe segment.",
        "2. Drain residual water into catchment container to prevent floor damage.",
        "3. Inspect pipe joints, gaskets, washers, or flush mechanism for wear or cracking.",
        "4. Apply fresh Teflon tape or PVC solvent weld and secure tight fitment.",
        "5. Turn water line back on slowly, inspect under pressure for 5 minutes for zero seepage."
    ],
    "IT & Network": [
        "1. Check physical link light status on access point / switch port.",
        "2. Run ping test & trace-route to DNS gateway (8.8.8.8 / campus router).",
        "3. Verify PoE power delivery and cable pin integrity using Cat6 tester.",
        "4. Check DHCP IP lease pool exhaustion on local VLAN subnet.",
        "5. Restart hardware or swap patch cord; verify seamless client connection."
    ],
    "HVAC": [
        "1. Check thermostat temperature sensor calibration and battery status.",
        "2. Inspect air filters and evaporator coils for dust clog or ice accumulation.",
        "3. Measure compressor running amp draw and check starting capacitor rating.",
        "4. Verify condensate water drain tray and discharge hose for blockages.",
        "5. Test supply vs return air temperature delta (target: 8°C - 12°C difference)."
    ],
    "Civil & Carpentry": [
        "1. Secure area and barricade if falling hazard or shattered glass present.",
        "2. Remove damaged lock/hinge/fixture without damaging door frame or wall mortar.",
        "3. Drill pilot holes and secure replacement hardware with hardened anchor screws.",
        "4. Test alignment, latching smoothness, and clearance gap.",
        "5. Clean sawdust/debris and verify safety latch operation."
    ],
    "Sanitation": [
        "1. Cordon off slippery area with high-visibility 'CAUTION WET FLOOR' cones.",
        "2. Apply absorbent material or bio-neutralizer for any liquid spills.",
        "3. Mechanically scrub and disinfect surface with dual-bucket mop system.",
        "4. Ensure proper drying and ventilation before removing warning signs."
    ]
}

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(category: str, department: str, severity: str, location: str) -> Dict[str, Any]:
        # Priority mapping
        if severity == "CRITICAL":
            priority = "P1 - IMMEDIATE (Emergency Dispatch within 1 Hour)"
        elif severity == "HIGH":
            priority = "P2 - HIGH PRIORITY (Dispatch within 4 Hours)"
        elif severity == "MEDIUM":
            priority = "P3 - STANDARD (Dispatch within 12 Hours)"
        else:
            priority = "P4 - ROUTINE (Dispatch within SLA 24-48 Hours)"

        # Suggest technician role
        tech_roles = {
            "Electrical Maintenance": "Certified Campus Electrician",
            "Plumbing & Water Works": "Senior Plumbing Specialist",
            "IT & Network Operations": "Systems & Network Engineer",
            "HVAC & Climate Control": "HVAC Technician",
            "Civil Works & Carpentry": "Civil & Carpentry Lead",
            "Housekeeping & Sanitation": "Sanitation Supervisor"
        }

        checklist = CATEGORY_ACTIONS.get(category, [
            "1. Inspect reported location and evaluate immediate safety hazards.",
            "2. Identify root cause and determine replacement parts needed.",
            "3. Carry out necessary repairs following campus standard operating procedure.",
            "4. Test and verify normal operation with complainant or facility staff."
        ])

        tools = DEPARTMENT_TOOLS.get(department, [
            "Standard Multi-tool Kit",
            "Inspection Torch Light",
            "Personal Protective Equipment (PPE)"
        ])

        safety_note = None
        if severity in ["CRITICAL", "HIGH"]:
            safety_note = "⚠️ CRITICAL SAFETY NOTICE: Follow campus safety protocols. Ensure area is barricaded and de-energized or isolated before servicing."

        return {
            "priority_level": priority,
            "action_checklist": checklist,
            "suggested_tools": tools,
            "safety_notes": safety_note,
            "suggested_technician_role": tech_roles.get(department, "Duty Technician")
        }
