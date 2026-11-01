package com.civicspot.service;

import com.civicspot.model.*;
import com.civicspot.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DataInitializerService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerService.class);

    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final GovernmentSchemeRepository schemeRepository;
    private final ComplaintRepository complaintRepository;
    private final FacilityReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializerService(
            UserRepository userRepository,
            FacilityRepository facilityRepository,
            GovernmentSchemeRepository schemeRepository,
            ComplaintRepository complaintRepository,
            FacilityReportRepository reportRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.facilityRepository = facilityRepository;
        this.schemeRepository = schemeRepository;
        this.complaintRepository = complaintRepository;
        this.reportRepository = reportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initUsers();
        initFacilities();
        initGovernmentSchemes();
        initComplaintsAndReports();
        log.info("CIVICSPOT database initialization complete.");
    }

    private void initUsers() {
        if (userRepository.count() == 0) {
            User admin = new User("Municipal Administrator", "admin@civicspot.org", passwordEncoder.encode("admin123"), Role.ADMIN);
            admin.setPhone("+91 98765 43210");
            admin.setPreferredLanguage("en");
            userRepository.save(admin);

            User citizen = new User("Aarav Sharma", "citizen@civicspot.org", passwordEncoder.encode("citizen123"), Role.CITIZEN);
            citizen.setPhone("+91 98765 01234");
            citizen.setPreferredLanguage("en");
            citizen.setWheelchairUser(false);
            userRepository.save(citizen);

            User citizenWheelchair = new User("Priya Reddy", "priya@civicspot.org", passwordEncoder.encode("citizen123"), Role.CITIZEN);
            citizenWheelchair.setPhone("+91 98765 56789");
            citizenWheelchair.setPreferredLanguage("te");
            citizenWheelchair.setWheelchairUser(true);
            userRepository.save(citizenWheelchair);

            log.info("Initialized default users: admin@civicspot.org and citizen@civicspot.org");
        }
    }

    private void initFacilities() {
        if (facilityRepository.count() == 0) {
            List<Facility> list = List.of(
                    createFacility("She Toilets & Smart Urinal Complex", FacilityCategory.PUBLIC_TOILET,
                            17.3850, 78.4867, "Beside Charminar Bus Stop, Pathergatti", "Charminar",
                            true, true, true, "Free", "06:00 - 22:00", 4.4, "OSM-NODE-101"),

                    createFacility("GHMC Modern Bio-Toilet Hub", FacilityCategory.PUBLIC_TOILET,
                            17.4065, 78.4772, "Opposite Public Gardens, Nampally", "Nampally",
                            true, true, false, "₹5", "24/7", 4.1, "OSM-NODE-102"),

                    createFacility("Jal Seva RO Purified Drinking Water ATM", FacilityCategory.DRINKING_WATER,
                            17.3888, 78.4812, "Near Mozamjahi Market Square, Abids", "Abids",
                            true, false, true, "Free", "24/7", 4.8, "OSM-NODE-201"),

                    createFacility("Hyderabad Metro RO Drinking Point", FacilityCategory.DRINKING_WATER,
                            17.4399, 78.4983, "Secunderabad Metro Concourse Level", "Secunderabad",
                            true, true, true, "Free", "06:00 - 23:00", 4.7, "OSM-NODE-202"),

                    createFacility("Smart Twin Segregated Waste Receptacle", FacilityCategory.DUSTBIN,
                            17.3830, 78.4740, "Laad Bazaar Pedestrian Way", "Charminar",
                            false, false, true, "Free", "24/7", 3.9, "OSM-NODE-301"),

                    createFacility("Municipal Compact Compactor & Recycling Unit", FacilityCategory.DUSTBIN,
                            17.4320, 78.4870, "Paradise Junction, MG Road", "Secunderabad",
                            true, false, true, "Free", "24/7", 4.0, "OSM-NODE-302"),

                    createFacility("Gandhi Memorial Government Hospital", FacilityCategory.HOSPITAL,
                            17.4239, 78.5033, "Musheerabad, Main Road", "Secunderabad",
                            true, true, true, "Free", "24/7", 4.5, "OSM-NODE-401"),

                    createFacility("Jan Aushadhi Kendra 24x7 Pharmacy", FacilityCategory.PHARMACY,
                            17.4010, 78.4820, "Station Road, Koti", "Koti",
                            true, true, false, "Generic rates", "24/7", 4.9, "OSM-NODE-402"),

                    createFacility("Central Police Station & Citizen Help Desk", FacilityCategory.POLICE_STATION,
                            17.3995, 78.4735, "Police Control Room Road, Basheerbagh", "Basheerbagh",
                            true, true, true, "Free", "24/7", 4.3, "OSM-NODE-501"),

                    createFacility("Mahatma Gandhi Bus Station (MGBS) Terminal", FacilityCategory.BUS_STOP,
                            17.3785, 78.4800, "Gowliguda Chaman, Imlibun", "MGBS",
                            true, true, true, "Public transit", "24/7", 4.2, "OSM-NODE-601"),

                    createFacility("Secunderabad Railway Terminal", FacilityCategory.RAILWAY_STATION,
                            17.4344, 78.5015, "Station Road, Secunderabad", "Secunderabad",
                            true, true, true, "Platform ticket", "24/7", 4.3, "OSM-NODE-602"),

                    createFacility("Lumbini Public Urban Park & Rest Gardens", FacilityCategory.PUBLIC_PARK,
                            17.4095, 78.4730, "Opposite Secretariat, Necklace Road", "Hussain Sagar",
                            true, true, false, "₹20", "09:00 - 21:00", 4.7, "OSM-NODE-701"),

                    createFacility("TSSPDCL Fast Public EV Charging Hub", FacilityCategory.EV_CHARGING,
                            17.4260, 78.4510, "Banjara Hills Road No. 1", "Banjara Hills",
                            true, true, false, "Commercial tariff", "24/7", 4.6, "OSM-NODE-801"),

                    createFacility("MeeSeva Citizen Services & Aadhaar Centre", FacilityCategory.GOVT_CENTRE,
                            17.4120, 78.4900, "RTC X Roads, Musheerabad", "Musheerabad",
                            true, true, true, "Official fees", "09:30 - 18:30", 4.1, "OSM-NODE-901"),

                    createFacility("Accessible Disability Rehabilitation Resource Centre", FacilityCategory.ACCESSIBLE_FACILITY,
                            17.4350, 78.4600, "Begumpet Road, Near Flyover", "Begumpet",
                            true, true, true, "Free", "09:00 - 17:00", 4.8, "OSM-NODE-902"),

                    // Verified facilities for user location: Denkada & Vizianagaram, Andhra Pradesh
                    createFacility("Denkada Village Community Sanitation Complex & Toilets", FacilityCategory.PUBLIC_TOILET,
                            18.0835, 83.4760, "Near Gram Panchayat Bhavan, Denkada Mandal", "Denkada",
                            true, true, true, "Free", "05:00 - 22:00", 4.6, "OSM-NODE-VZM-101"),

                    createFacility("Denkada Mandal Praja Parishad RO Drinking Water ATM", FacilityCategory.DRINKING_WATER,
                            18.0842, 83.4752, "Main Road, Opp Zilla Parishad High School, Denkada", "Denkada",
                            true, true, true, "Free", "24/7", 4.8, "OSM-NODE-VZM-102"),

                    createFacility("Denkada Primary Health Centre (PHC)", FacilityCategory.HOSPITAL,
                            18.0820, 83.4785, "Hospital Road, Denkada Mandal", "Denkada",
                            true, true, true, "Free", "24/7", 4.5, "OSM-NODE-VZM-103"),

                    createFacility("Denkada Swachh Gram Segregated Solid Waste Unit", FacilityCategory.DUSTBIN,
                            18.0850, 83.4740, "Near Panchayat Compost Yard, Denkada", "Denkada",
                            false, false, true, "Free", "24/7", 4.1, "OSM-NODE-VZM-104"),

                    createFacility("Vizianagaram RTC Complex She Toilets & Restroom", FacilityCategory.PUBLIC_TOILET,
                            18.1150, 83.3980, "Platform 1, RTC Bus Complex, Vizianagaram", "RTC Complex",
                            true, true, false, "₹5", "24/7", 4.3, "OSM-NODE-VZM-201"),

                    createFacility("Vizianagaram Junction Accessible Restrooms & RO Water", FacilityCategory.PUBLIC_TOILET,
                            18.1172, 83.4014, "Station Road, Vizianagaram Railway Junction", "Station Road",
                            true, true, true, "Platform ticket", "24/7", 4.5, "OSM-NODE-VZM-202"),

                    createFacility("Maharaja District Government Hospital (GGH)", FacilityCategory.HOSPITAL,
                            18.1120, 83.4035, "Cantonment, Vizianagaram", "Cantonment",
                            true, true, true, "Free", "24/7", 4.6, "OSM-NODE-VZM-203"),

                    createFacility("Clock Tower RO Purified Drinking Water Dispenser", FacilityCategory.DRINKING_WATER,
                            18.1124, 83.4077, "Main Bazaar, Clock Tower Junction", "Clock Tower",
                            true, false, true, "Free", "06:00 - 23:00", 4.7, "OSM-NODE-VZM-204"),

                    createFacility("Vizianagaram Municipal Segregated Waste Receptacle", FacilityCategory.DUSTBIN,
                            18.1135, 83.4060, "Near Fort Road Pedestrian Walk", "Fort Area",
                            true, false, true, "Free", "24/7", 4.2, "OSM-NODE-VZM-205", 14, "ADMIN_VERIFIED"),

                    createFacility("RTC Complex Segregated Waste & Recycling Station", FacilityCategory.DUSTBIN,
                            18.1158, 83.3990, "Outer Concourse, RTC Bus Stand, Vizianagaram", "RTC Complex",
                            true, true, true, "Free", "24/7", 4.4, "OSM-NODE-VZM-206", 9, "OSM_MAPPED"),

                    createFacility("Cantonment Road Municipal Cleanliness Dustbin Hub", FacilityCategory.DUSTBIN,
                            18.1110, 83.4020, "Cantonment Road, Near Municipal Office", "Cantonment",
                            true, false, true, "Free", "24/7", 4.0, "OSM-NODE-VZM-207", 6, "COMMUNITY_SUPPORTED"),

                    createFacility("Pradhan Mantri Jan Aushadhi Kendra (Generic Pharmacy)", FacilityCategory.PHARMACY,
                            18.1140, 83.4050, "Shop 4, Hospital Road, Cantonment", "Cantonment",
                            true, true, false, "Subsidized prices", "08:00 - 22:00", 4.9, "OSM-NODE-VZM-301", 38, "OFFICIALLY_VERIFIED"),

                    createFacility("Vizianagaram I Town Police Station", FacilityCategory.POLICE_STATION,
                            18.1130, 83.4065, "Fort Road, Old Town", "Fort Area",
                            true, true, true, "Free", "24/7", 4.3, "OSM-NODE-VZM-401", 12, "ADMIN_VERIFIED"),

                    createFacility("Vizianagaram II Town Police Station", FacilityCategory.POLICE_STATION,
                            18.1170, 83.4010, "Station Road, Cantonment", "Cantonment",
                            true, true, true, "Free", "24/7", 4.2, "OSM-NODE-VZM-402", 8, "ADMIN_VERIFIED"),

                    createFacility("Denkada Mandal Police Station", FacilityCategory.POLICE_STATION,
                            18.0840, 83.4770, "Main Road, Denkada Mandal", "Denkada",
                            true, true, true, "Free", "24/7", 4.1, "OSM-NODE-VZM-403", 5, "ADMIN_VERIFIED"),

                    createFacility("Tirumala Multi-Speciality District Hospital", FacilityCategory.HOSPITAL,
                            18.1180, 83.3950, "Ring Road Junction, Vizianagaram", "Ring Road",
                            true, true, false, "Standard rates", "24/7", 4.7, "OSM-NODE-VZM-105", 29, "ADMIN_VERIFIED"),

                    createFacility("Apollo 24/7 Pharmacy & First Aid Hub", FacilityCategory.PHARMACY,
                            18.1155, 83.3985, "Beside RTC Complex, Vizianagaram", "RTC Complex",
                            true, true, false, "Standard rates", "24/7", 4.8, "OSM-NODE-VZM-302", 21, "ADMIN_VERIFIED"),

                    createFacility("Mayuri Central Park & Walking Track", FacilityCategory.PUBLIC_PARK,
                            18.1190, 83.4040, "Balaji Nagar, Vizianagaram", "Balaji Nagar",
                            true, true, false, "₹10", "05:00 - 20:30", 4.6, "OSM-NODE-VZM-501", 24, "OSM_MAPPED"),

                    createFacility("Vizianagaram RTC Central Bus Station Terminal", FacilityCategory.BUS_STOP,
                            18.1150, 83.3980, "RTC Bus Complex, Vizianagaram", "RTC Complex",
                            true, true, true, "Public transit", "24/7", 4.2, "OSM-NODE-VZM-601", 45, "ADMIN_VERIFIED"),

                    createFacility("APEPDCL Fast EV Charging Hub", FacilityCategory.EV_CHARGING,
                            18.1160, 83.3970, "Substation Enclosure, Near RTC Complex", "RTC Complex",
                            true, true, false, "Tariff as per meter", "24/7", 4.7, "OSM-NODE-VZM-701", 11, "OFFICIALLY_VERIFIED")
            );

            facilityRepository.saveAll(list);
            log.info("Initialized {} civic facilities.", list.size());
        }
    }

    private Facility createFacility(String name, FacilityCategory category, Double lat, Double lng,
                                   String address, String area, boolean accessible, boolean hasRamp,
                                   boolean isFree, String fee, String hours, Double rating, String osmId) {
        return createFacility(name, category, lat, lng, address, area, accessible, hasRamp, isFree, fee, hours, rating, osmId, 1, "ADMIN_VERIFIED");
    }

    private Facility createFacility(String name, FacilityCategory category, Double lat, Double lng,
                                   String address, String area, boolean accessible, boolean hasRamp,
                                   boolean isFree, String fee, String hours, Double rating, String osmId,
                                   int totalReviews, String source) {
        Facility f = new Facility();
        f.setName(name);
        f.setCategory(category);
        f.setLatitude(lat);
        f.setLongitude(lng);
        f.setAddress(address);
        f.setArea(area);
        f.setAccessible(accessible);
        f.setHasRamp(hasRamp);
        f.setFree(isFree);
        f.setFee(fee);
        f.setOpeningHours(hours);
        f.setCleanlinessRating(rating);
        f.setTotalReviews(totalReviews);
        f.setOsmId(osmId);
        f.setVerified(true);
        f.setSource(source != null ? source : "ADMIN_VERIFIED");
        f.setOperationalStatus("OPERATIONAL");
        return f;
    }

    private void initGovernmentSchemes() {
        if (schemeRepository.count() == 0) {
            List<GovernmentScheme> schemes = List.of(
                    new GovernmentScheme(
                            "Swachh Bharat Mission (Urban 2.0)",
                            "Ministry of Housing and Urban Affairs",
                            "Sanitation & Waste Management",
                            "Flagship initiative aiming to achieve 'Garbage Free' status for all Indian cities through source segregation, complete greywater management, and modern sanitary toilet infrastructure.",
                            "All urban households, urban local bodies (ULBs), and urban citizens.",
                            "Financial assistance for individual household latrines, community toilets, and mechanized solid waste management.",
                            "Aadhaar Card, Residence Proof, Bank Account details.",
                            "Apply online via SBM-Urban portal or local Municipal Ward Office.",
                            "https://swachhbharaturban.gov.in",
                            "October 2026",
                            "myscheme.gov.in"
                    ),
                    new GovernmentScheme(
                            "Jal Jeevan Mission (Urban)",
                            "Ministry of Housing and Urban Affairs",
                            "Water Supply",
                            "Aims to provide universal coverage of functional water supply tap connections in all statutory towns, ensuring 55 litres per capita per day potable water.",
                            "Residents of all statutory towns lacking individual tap connections.",
                            "Piped tap water connection with water quality assurance testing.",
                            "Property tax receipt, Aadhaar Card, proof of address.",
                            "Apply through local municipal water board or Urban Local Body single window portal.",
                            "https://jaljeevanmission.gov.in",
                            "October 2026",
                            "india.gov.in"
                    ),
                    new GovernmentScheme(
                            "Sugamya Bharat Abhiyan (Accessible India Campaign)",
                            "Ministry of Social Justice and Empowerment",
                            "Disability Welfare & Urban Accessibility",
                            "Nationwide campaign for achieving universal accessibility for persons with disabilities in built environments, public transportation, and information systems.",
                            "Persons with disabilities (PwDs), elderly citizens, and urban municipalities.",
                            "Retrofitting public buildings with ramps, tactile tiles, accessible washrooms, and audio-visual lift indicators.",
                            "Disability Certificate (UDID Card), Aadhaar Card.",
                            "Access grievance and retrofitting request portal via Accessible India App.",
                            "https://accessibleindia.gov.in",
                            "September 2026",
                            "myscheme.gov.in"
                    ),
                    new GovernmentScheme(
                            "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
                            "National Health Authority / Ministry of Health",
                            "Healthcare",
                            "World's largest government-financed health assurance scheme providing a health cover of ₹5 lakh per family per year for secondary and tertiary hospitalisation care.",
                            "Economically vulnerable families identified through SECC 2011 database and Ayushman Bharat criteria.",
                            "Cashless and paperless access to healthcare services at empanelled public and private hospitals.",
                            "Ayushman Card, Ration Card, Aadhaar Card.",
                            "Visit nearest Ayushman Mitra kiosk at any government or empanelled hospital.",
                            "https://pmjay.gov.in",
                            "October 2026",
                            "india.gov.in"
                    ),
                    new GovernmentScheme(
                            "Pradhan Mantri Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
                            "Ministry of Housing and Urban Affairs",
                            "Urban Livelihoods & Street Infrastructure",
                            "Special micro-credit facility for urban street vendors to support working capital loans with interest subsidy and digital transaction cashbacks.",
                            "Urban street vendors operating prior to March 2020 with vending certificate.",
                            "Working capital loans up to ₹50,000 with 7% interest subsidy.",
                            "Certificate of Vending / ID card issued by Urban Local Body, Aadhaar.",
                            "Apply on PM SVANidhi portal or through Common Service Centres (CSC).",
                            "https://pmsvanidhi.mohua.gov.in",
                            "October 2026",
                            "myscheme.gov.in"
                    )
            );

            schemeRepository.saveAll(schemes);
            log.info("Initialized {} government schemes.", schemes.size());
        }
    }

    private void initComplaintsAndReports() {
        if (complaintRepository.count() == 0 && reportRepository.count() == 0) {
            User citizen = userRepository.findByEmail("citizen@civicspot.org").orElse(null);
            if (citizen != null) {
                // Initial Complaint
                Complaint complaint = new Complaint();
                complaint.setUser(citizen);
                complaint.setTrackingNumber("CIV-2026-9F4A1C");
                complaint.setTitle("Broken streetlight and damaged pavement near Mozamjahi Market");
                complaint.setCategory("STREET_LIGHTING");
                complaint.setDescription("Three continuous streetlights are non-functional creating hazardous conditions for pedestrians after dusk.");
                complaint.setLatitude(17.3888);
                complaint.setLongitude(78.4812);
                complaint.setAddress("Mozamjahi Market Square, Abids, Hyderabad");
                complaint.setDepartment("MUNICIPAL_CORPORATION");
                complaint.setPriority("HIGH");
                complaint.setStatus("IN_PROGRESS");
                complaint.setStatusHistory("[{\"status\":\"SUBMITTED\",\"timestamp\":\"2026-10-25T10:00:00Z\",\"comment\":\"Complaint logged by citizen.\"},{\"status\":\"UNDER_REVIEW\",\"timestamp\":\"2026-10-26T14:30:00Z\",\"comment\":\"Assigned to Circle 9 Electrical Maintenance Wing.\"},{\"status\":\"IN_PROGRESS\",\"timestamp\":\"2026-10-28T09:15:00Z\",\"comment\":\"Repair team deployed with spare LED fixtures.\"}]");
                complaintRepository.save(complaint);

                // Initial Report
                FacilityReport report = new FacilityReport();
                report.setUser(citizen);
                report.setIssueCategory("DIRTY_TOILET");
                report.setFacilityName("She Toilets & Smart Urinal Complex");
                report.setDescription("Flush mechanism jammed in cubicle 2 and water tap leaking.");
                report.setLatitude(17.3850);
                report.setLongitude(78.4867);
                report.setAddress("Beside Charminar Bus Stop, Pathergatti");
                report.setSeverity("MEDIUM");
                report.setStatus("UNDER_REVIEW");
                report.setAiAssessment("AI Assessment: Mechanical plumbing malfunction detected. Moderate sanitation risk; priority sanitization ticket triggered.");
                reportRepository.save(report);

                log.info("Initialized sample complaint and facility report.");
            }
        }
    }
}
