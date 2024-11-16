// const Tracking = require('../models/Tracking'); // Import the Tracking model


// // Get tracking status for a specific order
// exports.getTrackingStatus = async (req, res) => {
//   const { orderId } = req.params;

//   try {
//     // Find tracking details associated with the purchase
//     const tracking = await Tracking.findOne({ orderId }).populate('orderId');
//     if (!tracking) {
//       return res.status(404).json({ message: "Tracking information not found for this order." });
//     }

//     // Respond with tracking information
//     return res.status(200).json({ tracking });
//   } catch (error) {
//     console.error("Error fetching tracking details:", error);
//     return res.status(500).json({ message: "An error occurred while retrieving tracking information." });
//   }
// };

// // Update tracking status for a specific order
// exports.updateTrackingStatus = async (req, res) => {
//   const { orderId } = req.params;
//   const { status, location, remarks } = req.body;

//   try {
//     // Find the tracking document
//     const tracking = await Tracking.findOne({ orderId });
//     if (!tracking) {
//       return res.status(404).json({ message: "Tracking information not found for this order." });
//     }

//     // Validate status input
//     const validStatuses = ["Shipped", "In Transit", "Out for Delivery", "Delivered"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid tracking status." });
//     }

//     // Add new tracking update to the trackingUpdates array
//     tracking.trackingUpdates.push({
//       status,
//       timestamp: new Date(),
//       location: location || "",
//       remarks: remarks || "",
//     });

//     // Update the current status of the order
//     tracking.currentStatus = status;

//     // Save the updated tracking document
//     await tracking.save();

//     // Respond with the updated tracking information
//     return res.status(200).json({ tracking });
//   } catch (error) {
//     console.error("Error updating tracking status:", error);
//     return res.status(500).json({ message: "An error occurred while updating tracking information." });
//   }
// };
