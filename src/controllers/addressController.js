const Address = require('../models/addressModel');  
const User = require('../models/User');  

// Create a new address
exports.createAddress = async (req, res) => {
  try {
    const { firstName, lastName, streetAddress, city, state, postalCode, country, phoneNumber, isDefault } = req.body;
    const userId = req.userId;

    // If this new address is marked as default, ensure no other address is default
    if (isDefault) {
      // Find the user's current default address and set it to false
      await Address.updateOne(
        { user: userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    // Create a new address
    const address = new Address({
      user: userId,
      firstName,
      lastName,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
      isDefault
    });

    // Save the new address
    await address.save();

    // Optionally, update the user's default address field (if your User model has this)
    if (isDefault) {
      await User.findByIdAndUpdate(userId, { defaultAddress: address._id });
    }

    res.status(201).json({
      success: true,
      message: 'Address saved successfully!',
      data: address
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error saving address',
      error: error.message
    });
  }
};

// Update an existing address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { firstName, lastName, streetAddress, city, state, postalCode, country, phoneNumber, isDefault } = req.body;

    // Find address by ID
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Update address fields
    address.firstName = firstName || address.firstName;
    address.lastName = lastName || address.lastName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    // Save updated address
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully!',
      data: address
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating address',
      error: error.message
    });
  }
};
