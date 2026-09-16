"""
Synthetic Smart Campus Complaint Dataset for ALORA AI Engine
Contains realistic, domain-specific complaints across all 6 campus facilities and maintenance divisions.
"""

TRAINING_DATA = [
    # =========================================================================
    # 1. ELECTRICAL MAINTENANCE
    # =========================================================================
    {
        "title": "Main corridor tube lights flickering and sparking",
        "description": "Tube light near room 302 in Hostel Block A is flickering and producing a humming noise with occasional sparks.",
        "location_building": "Hostel Block A",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "HIGH",
        "resolution_hours": 3.5
    },
    {
        "title": "Circuit breaker MCB tripped in CS Lab 2",
        "description": "All desktop power sockets in row 4 lost power after student plugged in an extension board. Circuit breaker tripped.",
        "location_building": "Science & Tech Block",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "CRITICAL",
        "resolution_hours": 2.0
    },
    {
        "title": "Ceiling fan making screeching noise and vibrating",
        "description": "Ceiling fan in Classroom 104 is loose and vibrating violently when run on speed 4 or 5.",
        "location_building": "Academic Complex",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "MEDIUM",
        "resolution_hours": 4.0
    },
    {
        "title": "Burnt plastic smell from switchboard in Library",
        "description": "Noticed sharp burning plastic smell coming from wall power outlet next to study desk 12 on ground floor.",
        "location_building": "Central Library",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "CRITICAL",
        "resolution_hours": 1.5
    },
    {
        "title": "Street light outside hostel pathway not working",
        "description": "Pole light #14 along the pathway between Hostel C and dining hall is completely dark at night.",
        "location_building": "Hostel Block C",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "LOW",
        "resolution_hours": 8.0
    },
    {
        "title": "Power socket broken and live wires exposed",
        "description": "Wall socket faceplate is cracked open with internal brass terminals exposed in Mechanical Workshop.",
        "location_building": "Engineering Workshop",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "CRITICAL",
        "resolution_hours": 2.0
    },
    {
        "title": "Switchboard toggle button stuck in ON position",
        "description": "Light switch in room 210 cannot be turned off, plastic switch is jammed.",
        "location_building": "Hostel Block B",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "LOW",
        "resolution_hours": 6.0
    },
    {
        "title": "Corridor emergency exit lights not illuminated",
        "description": "Emergency exit signage lights on 4th floor staircase are unlit during power fluctuation.",
        "location_building": "Main Admin Complex",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "HIGH",
        "resolution_hours": 3.0
    },
    {
        "title": "Fan regulator knob broken in Lecture Hall 203",
        "description": "Fan speed regulator knob fell off, fan permanently stuck on highest speed causing paper flutter.",
        "location_building": "Academic Complex",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "LOW",
        "resolution_hours": 5.0
    },
    {
        "title": "Sparks flying from electrical distribution box",
        "description": "Main electrical DB box on ground floor corridor sparking and crackling loudly. Urgent danger.",
        "location_building": "Hostel Block A",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "CRITICAL",
        "resolution_hours": 1.0
    },
    {
        "title": "Power outage in East Wing hostel rooms",
        "description": "Entire wing of 12 rooms has no electricity while other wings have power. Phase failure suspected.",
        "location_building": "Hostel Block B",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "HIGH",
        "resolution_hours": 2.5
    },
    {
        "title": "Electric shock sensation on metal staircase railing",
        "description": "Mild tingling shock felt when touching handrail near outdoor generator enclosure. Earthing leakage.",
        "location_building": "Science & Tech Block",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "CRITICAL",
        "resolution_hours": 1.5
    },
    {
        "title": "UPS battery backup beeping continuously in Lab 5",
        "description": "Central lab UPS giving continuous overload warning alarm and flashing red warning LED.",
        "location_building": "Computer Science Block",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "HIGH",
        "resolution_hours": 3.0
    },
    {
        "title": "Tube light blown and buzzing loudly",
        "description": "Tube light starter buzzing and bulb blackened, flickering continuously in faculty office.",
        "location_building": "Academic Complex",
        "category": "Electrical",
        "department": "Electrical Maintenance",
        "severity": "LOW",
        "resolution_hours": 4.0
    },

    # =========================================================================
    # 2. PLUMBING & WATER WORKS
    # =========================================================================
    {
        "title": "Water pipe leaking continuously under washbasin",
        "description": "Washbasin flexible hose cracked in 2nd floor restroom, clean water overflowing onto floor.",
        "location_building": "Science & Tech Block",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "HIGH",
        "resolution_hours": 3.0
    },
    {
        "title": "Main overhead tank supply pipeline ruptured",
        "description": "High pressure water pipe burst near water filtration unit. Water gushing onto garden and ground floor.",
        "location_building": "Central Utility Station",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "CRITICAL",
        "resolution_hours": 1.5
    },
    {
        "title": "Washroom toilet flush valve stuck flowing non-stop",
        "description": "Flush valve in stall 3 ground floor toilet won't shut off, wasting continuous stream of water.",
        "location_building": "Academic Complex",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "MEDIUM",
        "resolution_hours": 4.0
    },
    {
        "title": "Drinking water cooler not dispensing cold water",
        "description": "Water cooler on 3rd floor hostel corridor dispensing tepid water, tap is loose and dripping.",
        "location_building": "Hostel Block A",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "LOW",
        "resolution_hours": 10.0
    },
    {
        "title": "Drainage clogged and foul water backing up",
        "description": "Floor drain in chemistry laboratory wash area is completely backed up with rinse water.",
        "location_building": "Science & Tech Block",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "CRITICAL",
        "resolution_hours": 2.5
    },
    {
        "title": "No running water in hostel 1st floor bathrooms",
        "description": "Taps are completely dry across all 1st floor hostel shower cubicles since this morning.",
        "location_building": "Hostel Block B",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "HIGH",
        "resolution_hours": 3.0
    },
    {
        "title": "Tap nozzle missing and water spraying sideways",
        "description": "Cafeteria handwash area tap aerator is broken, water sprays uncontrollably on visitors clothes.",
        "location_building": "Student Dining Hall",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "MEDIUM",
        "resolution_hours": 5.0
    },
    {
        "title": "Severe water leakage from ceiling pipe joint",
        "description": "Water dripping heavily through false ceiling from overhead bathroom pipe into classroom 204.",
        "location_building": "Academic Complex",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "HIGH",
        "resolution_hours": 2.5
    },
    {
        "title": "Water motor pump not turning on for rooftop tank",
        "description": "Submersible pump controller tripping immediately, rooftop header tank is near empty.",
        "location_building": "Hostel Block C",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "HIGH",
        "resolution_hours": 3.0
    },
    {
        "title": "Hostel shower head detached and spurting water",
        "description": "Shower head fell off threaded pipe in cubicle 4, water shoots across door.",
        "location_building": "Hostel Block A",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "MEDIUM",
        "resolution_hours": 4.0
    },
    {
        "title": "Kitchen drain line blocked with grease and food waste",
        "description": "Main cafeteria dishwashing drain sink is overflowing onto pantry floor.",
        "location_building": "Student Dining Hall",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "HIGH",
        "resolution_hours": 2.0
    },
    {
        "title": "Water leaking from tap in bathroom",
        "description": "Bathroom tap is constantly leaking and dripping, cannot shut off water tightly.",
        "location_building": "Hostel Block B",
        "category": "Plumbing",
        "department": "Plumbing & Water Works",
        "severity": "MEDIUM",
        "resolution_hours": 3.0
    },

    # =========================================================================
    # 3. IT & NETWORK OPERATIONS
    # =========================================================================
    {
        "title": "Hostel Wi-Fi router AP unreachable and down",
        "description": "Wi-Fi access point AP-09 on 3rd floor hostel shows solid red LED. SSIDs Campus-WiFi and Eduroam not visible.",
        "location_building": "Hostel Block A",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "MEDIUM",
        "resolution_hours": 3.0
    },
    {
        "title": "Server room core switch fiber optic link error",
        "description": "Fiber uplink between Science Block distribution switch and Core Gateway down. Multiple research labs disconnected.",
        "location_building": "Central Data Center",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "CRITICAL",
        "resolution_hours": 1.0
    },
    {
        "title": "Classroom ceiling projector HDMI audio/video failure",
        "description": "Auditorium 1 projector showing 'No Signal' when HDMI cable connected to presenter podium.",
        "location_building": "Academic Complex",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "MEDIUM",
        "resolution_hours": 2.5
    },
    {
        "title": "Ethernet LAN port physically loose at terminal desk 15",
        "description": "RJ45 wall port in CS Lab 1 has bent pins and cannot establish 1Gbps link.",
        "location_building": "Computer Science Block",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "LOW",
        "resolution_hours": 6.0
    },
    {
        "title": "Biometric attendance scanner device unresponsive",
        "description": "Fingerprint / RFID scanner at Main Faculty entrance is frozen on boot screen with continuous beep.",
        "location_building": "Main Admin Complex",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "HIGH",
        "resolution_hours": 2.0
    },
    {
        "title": "Campus intranet portal DNS resolution timeout",
        "description": "Students cannot load exam registration portal while connected to hostel LAN. DNS timeouts reported.",
        "location_building": "Central Data Center",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "HIGH",
        "resolution_hours": 2.0
    },
    {
        "title": "Extremely slow internet speed and packet loss in library",
        "description": "Wi-Fi speeds in library 1st floor reading zone dropping below 50 Kbps with 60% packet drop.",
        "location_building": "Central Library",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "MEDIUM",
        "resolution_hours": 3.0
    },
    {
        "title": "Smart digital interactive board touchscreen not responding",
        "description": "Interactive smart board in Seminar Room 3 touch overlay not calibrating or responding to stylus.",
        "location_building": "Academic Complex",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "LOW",
        "resolution_hours": 4.5
    },
    {
        "title": "Desktop computer in lab not booting into operating system",
        "description": "PC-24 in Computer Lab 3 showing hard drive SMART error on boot.",
        "location_building": "Computer Science Block",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "LOW",
        "resolution_hours": 5.0
    },
    {
        "title": "wifi not working in library",
        "description": "wifi is disconnected and students unable to connect to campus wifi network",
        "location_building": "Central Library",
        "category": "IT & Network",
        "department": "IT & Network Operations",
        "severity": "MEDIUM",
        "resolution_hours": 2.0
    },

    # =========================================================================
    # 4. HVAC & CLIMATE CONTROL
    # =========================================================================
    {
        "title": "Split AC in Server Room blowing warm air",
        "description": "Primary split AC in server rack room has stopped cooling, ambient temperature reached 32°C.",
        "location_building": "Central Data Center",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "CRITICAL",
        "resolution_hours": 1.5
    },
    {
        "title": "AC indoor unit leaking condensed water onto floor",
        "description": "Split AC unit in Seminar Hall 2 is dripping water continuously, soaking carpet and chairs beneath.",
        "location_building": "Academic Complex",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "HIGH",
        "resolution_hours": 3.0
    },
    {
        "title": "HVAC duct blower producing loud rattling noise",
        "description": "Central air duct in Library 2nd floor reading hall is vibrating and making rhythmic metallic sound.",
        "location_building": "Central Library",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "MEDIUM",
        "resolution_hours": 6.0
    },
    {
        "title": "Thermostat remote display damaged in Faculty Lounge",
        "description": "AC remote control display cracked and buttons unresponsive, cannot change room temperature.",
        "location_building": "Science & Tech Block",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "LOW",
        "resolution_hours": 12.0
    },
    {
        "title": "Air conditioner not cooling classroom during afternoon lectures",
        "description": "Split AC compressor in Room 305 cuts off after 5 minutes, blowing room temperature air in intense heat.",
        "location_building": "Academic Complex",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "MEDIUM",
        "resolution_hours": 4.0
    },
    {
        "title": "air conditioner making loud noise",
        "description": "ac unit vibrating violently and cooling is very weak in seminar hall",
        "location_building": "Academic Complex",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "MEDIUM",
        "resolution_hours": 3.5
    },
    {
        "title": "AC outdoor condenser unit fan stopped spinning",
        "description": "Outdoor unit of air conditioner mounted on 2nd floor exterior wall humming loudly but fan blade stationary.",
        "location_building": "Hostel Block A",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "HIGH",
        "resolution_hours": 3.5
    },
    {
        "title": "Foul moldy musty odor coming from AC cooling vents",
        "description": "Air conditioner in Conference Room emitting pungent damp smell when switched on. Filters need urgent cleaning.",
        "location_building": "Main Admin Complex",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "LOW",
        "resolution_hours": 5.0
    },
    {
        "title": "Central chiller temperature sensor reading error",
        "description": "Central chilled water air handling unit (AHU) displaying sensor fault code E-04 on digital panel.",
        "location_building": "Science & Tech Block",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "CRITICAL",
        "resolution_hours": 2.0
    },
    {
        "title": "air conditioner not working in auditorium",
        "description": "AC not turning on with remote, no air flow or cooling in the main hall.",
        "location_building": "Academic Complex",
        "category": "HVAC",
        "department": "HVAC & Climate Control",
        "severity": "HIGH",
        "resolution_hours": 3.0
    },

    # =========================================================================
    # 5. CIVIL WORKS & CARPENTRY
    # =========================================================================
    {
        "title": "Classroom door lock cylinder broken, door won't latch",
        "description": "Main door to Physics Lab 202 cannot be locked, key is broken inside lock cylinder.",
        "location_building": "Science & Tech Block",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "HIGH",
        "resolution_hours": 4.0
    },
    {
        "title": "Window glass pane shattered due to strong wind",
        "description": "Window glass cracked on 3rd floor stairwell with sharp glass fragments hanging dangerously.",
        "location_building": "Hostel Block A",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "CRITICAL",
        "resolution_hours": 2.5
    },
    {
        "title": "Wooden desk bench wobbling with loose screws",
        "description": "Student desk row 3 in lecture hall 101 has stripped bolts and tilts when sat on.",
        "location_building": "Academic Complex",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "LOW",
        "resolution_hours": 16.0
    },
    {
        "title": "False ceiling tile dislodged and sagging",
        "description": "Gypsum ceiling tile in department corridor is hanging loose and may fall on pedestrians.",
        "location_building": "Main Admin Complex",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "HIGH",
        "resolution_hours": 5.0
    },
    {
        "title": "Wardrobe door hinge ripped off in hostel room 214",
        "description": "Wooden cupboard door hinge screw holes are worn out, door fell off.",
        "location_building": "Hostel Block B",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "LOW",
        "resolution_hours": 18.0
    },
    {
        "title": "Broken chair leg and cracked backrest in computer room",
        "description": "Revolving chair at terminal 8 has broken caster wheel and cracked armrest.",
        "location_building": "Computer Science Block",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "LOW",
        "resolution_hours": 12.0
    },
    {
        "title": "broken desk chair in room 201",
        "description": "student chair broken wooden leg and desk wobbles",
        "location_building": "Academic Complex",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "LOW",
        "resolution_hours": 8.0
    },
    {
        "title": "Door handle and latch mechanism jammed shut",
        "description": "Restroom stall door in Library ground floor has jammed latch, latch won't turn from outside.",
        "location_building": "Central Library",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "HIGH",
        "resolution_hours": 2.0
    },
    {
        "title": "Cracked ceramic floor tile causing tripping hazard",
        "description": "Broken floor tile with sharp edges protruding along busy main entrance hallway.",
        "location_building": "Academic Complex",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "MEDIUM",
        "resolution_hours": 8.0
    },
    {
        "title": "Classroom whiteboard detached from wall mounting",
        "description": "Large magnetic whiteboard in Room 108 came loose on left bracket and is hanging crooked.",
        "location_building": "Academic Complex",
        "category": "Civil & Carpentry",
        "department": "Civil Works & Carpentry",
        "severity": "MEDIUM",
        "resolution_hours": 4.0
    },

    # =========================================================================
    # 6. HOUSEKEEPING & SANITATION
    # =========================================================================
    {
        "title": "dustbin",
        "description": "dustbin overflow",
        "location_building": "Hostel Block B",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "MEDIUM",
        "resolution_hours": 1.5
    },
    {
        "title": "dustbin",
        "description": "dustbin overflow in room 302",
        "location_building": "Hostel Block B",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "MEDIUM",
        "resolution_hours": 1.5
    },
    {
        "title": "dustbin overflow",
        "description": "dustbin is completely full and overflowing with garbage on the floor",
        "location_building": "Hostel Block B",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "MEDIUM",
        "resolution_hours": 1.5
    },
    {
        "title": "dustbin overflow in corridor",
        "description": "garbage not cleaned and dustbins overflowing with plastic and waste",
        "location_building": "Academic Complex",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "MEDIUM",
        "resolution_hours": 1.5
    },
    {
        "title": "Waste disposal dustbin overflowing in corridor",
        "description": "Trash can outside room 302 is overflowing with wrappers, food containers, and garbage onto the walkway.",
        "location_building": "Hostel Block B",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "MEDIUM",
        "resolution_hours": 2.0
    },
    {
        "title": "Garbage bin overflowing in cafeteria lobby",
        "description": "Food packaging, plastic bottles and beverage cups overflowing from main trash container, spilling onto pavement.",
        "location_building": "Student Dining Hall",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "MEDIUM",
        "resolution_hours": 2.0
    },
    {
        "title": "Large water puddle and mud causing slip hazard",
        "description": "Staircase landing between floor 1 and 2 is slippery due to rainwater pooling and mud accumulation. Sweeping and mopping needed.",
        "location_building": "Hostel Block C",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "HIGH",
        "resolution_hours": 1.5
    },
    {
        "title": "Hostel washroom requires deep cleaning and disinfection",
        "description": "Wing A 2nd floor community washroom has filthy floors, stains and unpleasant odor. Needs immediate cleaning and bleaching.",
        "location_building": "Hostel Block A",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "MEDIUM",
        "resolution_hours": 2.5
    },
    {
        "title": "Chemical spill cleanup needed in Chemistry store room",
        "description": "Small container of mild cleaning solvent spilled on ceramic tiled floor, needs immediate mop and ventilation.",
        "location_building": "Science & Tech Block",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "HIGH",
        "resolution_hours": 1.0
    },
    {
        "title": "Litter and food waste scattered in courtyard after campus event",
        "description": "Courtyard benches and lawn covered in discarded paper plates, cups, and food leftovers.",
        "location_building": "Academic Complex",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "LOW",
        "resolution_hours": 3.0
    },
    {
        "title": "Severe foul odor and uncleaned toilets in sports complex",
        "description": "Ground floor restrooms have unbearable stench and dirty toilets, lack of cleaning chemicals.",
        "location_building": "Sports Complex",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "HIGH",
        "resolution_hours": 2.0
    },
    {
        "title": "Sanitary napkin dispenser empty and disposal bin full",
        "description": "Women's restroom 3rd floor sanitary waste bin is overflowing, hygiene risk.",
        "location_building": "Central Library",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "HIGH",
        "resolution_hours": 1.5
    },
    {
        "title": "Pest control needed for cockroach infestation in pantry",
        "description": "Multiple cockroaches seen behind hostel pantry shelves and water dispenser area.",
        "location_building": "Hostel Block A",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "MEDIUM",
        "resolution_hours": 6.0
    },
    {
        "title": "Classroom floor covered in dirt, chalk dust, and discarded paper",
        "description": "Lecture theatre 201 has not been swept or mopped since yesterday, needs thorough broom sweep.",
        "location_building": "Academic Complex",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "LOW",
        "resolution_hours": 2.0
    },
    {
        "title": "cleaning required in classroom",
        "description": "floor is dirty and covered with dust, needs sweeping and mopping",
        "location_building": "Academic Complex",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "LOW",
        "resolution_hours": 2.0
    },
    {
        "title": "garbage pile outside hostel",
        "description": "trash and waste bags dumped outside hostel entrance, needs housekeeping to clear garbage",
        "location_building": "Hostel Block B",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "MEDIUM",
        "resolution_hours": 2.0
    },
    {
        "title": "Trash can missing in 2nd floor hostel corridor",
        "description": "No dustbin available in Wing B corridor, students leaving garbage bags in corner.",
        "location_building": "Hostel Block B",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "LOW",
        "resolution_hours": 4.0
    },
    {
        "title": "Spilled beverage sticky stain on study desk carpet",
        "description": "Large coffee spill dried into carpet in quiet reading room, sticky and staining floor.",
        "location_building": "Central Library",
        "category": "Sanitation",
        "department": "Housekeeping & Sanitation",
        "severity": "LOW",
        "resolution_hours": 3.0
    }
]
