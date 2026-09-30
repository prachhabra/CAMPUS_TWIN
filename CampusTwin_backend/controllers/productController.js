const Product = require('../models/Product');
const Notification = require('../models/Notification');

// @desc    Get marketplace products with search, category, status, pagination
// @route   GET /api/products
// @access  Public / Authenticated
const getProducts = async (req, res, next) => {
  try {
    const { q, category, condition, status = 'available', page = 1, limit = 12 } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (condition && condition !== 'All') {
      query.condition = condition;
    }
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('seller', 'name email phone department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: products,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public / Authenticated
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name email phone department rollNumber year profileImage'
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product listing not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create marketplace listing
// @route   POST /api/products
// @access  Private (Student, Teacher, Admin)
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, condition, images, contactPhone, contactEmail } =
      req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and price'
      });
    }

    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category || 'Books',
      condition: condition || 'Good',
      seller: req.user._id,
      images: images || [],
      contactPhone: contactPhone || req.user.phone || '',
      contactEmail: contactEmail || req.user.email || '',
      status: 'available'
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully on Marketplace',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product listing
// @route   PUT /api/products/:id
// @access  Private (Seller or Admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product listing not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this listing'
      });
    }

    const fields = ['title', 'description', 'price', 'category', 'condition', 'images', 'status', 'contactPhone', 'contactEmail'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        product[f] = req.body[f];
      }
    });

    const updated = await product.save();
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product listing
// @route   DELETE /api/products/:id
// @access  Private (Seller or Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product listing not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
