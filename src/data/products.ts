export const CATEGORIES = [
  "All Products",
  "Baby & Toddler",
  "Cold Chain Equipment",
  "Diagnostic Devices",
  "Cardiology Diagnostic Devices",
  "Neurology Diagnostic Devices",
  "Obstetrics & Gynecology Diagnostic Devices",
  "Ultrasound & Sonography Systems",
  "Emergency & Critical Care Equipment",
  "Fluid Control & Pneumatic Components",
  "Hospital Furniture & Infrastructure",
  "Imaging & Radiology Supplies",
  "Laboratory Equipment",
  "Medical Consumables",
  "Medical Equipment",
  "Medical Supplies",
  "Medical Gas Equipment",
  "Neonatal & NICU Equipment",
  "Patient Monitoring Accessories",
  "Respiratory & Anesthesia",
  "Respiratory Care",
  "Sterilization & Infection Control Equipment (Autoclaves)",
  "Surgical Equipment & Accessories",
  "ECG Accessories",
];

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const rawProducts = [
  { id: 1, name: "EliteFlow Portable Oxygen Concentrator", category: "Respiratory Care" },
  { id: 2, name: "ABPM Machine – 24-Hour BP Monitor", category: "Cardiology Diagnostic Devices" },
  { id: 3, name: "Diamond Manual BP Cuff", category: "Patient Monitoring Accessories" },
  { id: 4, name: "Longfian Oxygen Concentrator", category: "Respiratory Care" },
  { id: 5, name: "Digital Glucometer (50 test strips included)", category: "Medical Supplies" },
  { id: 6, name: "Blue Inkjet Medical Film", category: "Imaging & Radiology Supplies" },
  { id: 7, name: "Flow Sensor", category: "Respiratory & Anesthesia" },
  { id: 8, name: "X-ray Collimator / LBD Lamps", category: "Imaging & Radiology Supplies" },
  { id: 9, name: "USG Paper (Ultrasound thermal paper)", category: "Imaging & Radiology Supplies" },
  { id: 10, name: "Bipolar Forceps & Bipolar Cable", category: "Surgical Equipment & Accessories" },
  { id: 11, name: "ECG Cable", category: "ECG Accessories" },
  { id: 12, name: "Pulse Oximeter", category: "Patient Monitoring Accessories" },
  { id: 13, name: "Oxygen Sensor", category: "Respiratory & Anesthesia" },
  { id: 14, name: "BP Cuff", category: "Patient Monitoring Accessories" },
  { id: 15, name: "Ultrasound Transmission Gel", category: "Diagnostic Devices" },
  { id: 16, name: "PFT Machine", category: "Diagnostic Devices" },
  { id: 17, name: "TMT Machine", category: "Cardiology Diagnostic Devices" },
  { id: 18, name: "ECG Machine", category: "Cardiology Diagnostic Devices" },
  { id: 19, name: "CTG Machine", category: "Obstetrics & Gynecology Diagnostic Devices" },
  { id: 20, name: "EEG Machine", category: "Neurology Diagnostic Devices" },
  { id: 21, name: "Patient Monitors", category: "Emergency & Critical Care Equipment" },
  { id: 22, name: "USG Machine", category: "Ultrasound & Sonography Systems" },
  { id: 23, name: "OT Bed", category: "Hospital Furniture & Infrastructure" },
  { id: 24, name: "Inkjet X-Ray Blue Medical Film", category: "Imaging & Radiology Supplies" },
  { id: 25, name: "CTG Probe", category: "Obstetrics & Gynecology Diagnostic Devices" },
  { id: 26, name: "Pressure Gauge", category: "Medical Gas Equipment" },
  { id: 27, name: "Oxygen Flowmeter", category: "Medical Gas Equipment" },
  { id: 28, name: "Sony Thermal Printer And Head", category: "Imaging & Radiology Supplies" },
];

const placeholderImages = [
  "/products/oxygen-concentrator.png",
  "/products/patient-monitor.png",
  "/products/infusion-pump.png",
  "/products/ecg-machine.jpg",
  "/products/bp-cuff.jpg",
  "/products/ultrasound-machine.jpg",
  "/products/hospital-bed.jpg",
  "/products/glucometer.jpg",
  "/products/pulse-oximeter.jpg"
];

export const PRODUCTS = rawProducts.map((p, index) => ({
  ...p,
  image: placeholderImages[index % placeholderImages.length],
  // Keep the slugified path as a secondary reference if needed later
  actualImagePath: `/products/${generateSlug(p.name)}.jpg`,
}));
