const Category = require('../models/Categories');

// creating a category
exports.createCategory = async (req, res)=>{
   try {
        const { name, description } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const exists = await Category.exists({
            name: new RegExp(`^${name}$`, "i")
        });

        if (exists) {
            return res.status(409).json({ message: "Category already exists" });
        }

        const category = await Category.create({
            name: name.trim(),
            description,
        });

        return res.status(201).json({
            message: "Category created successfully",
            data: category
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Duplicate value detected" });
        }

        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

// fetching all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 });

    res.status(200).json({
      data: categories,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteCategory = async (req,res)=>{
  try {

    const categoryId = req.params.id

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if(!deletedCategory){
      return res.status(404).json({
        message:"Category not found"
      });
    }

    res.status(200).json({
      message:`Category ${deletedCategory.name} deleted successfully`
    });

  } catch (err) {

    res.status(500).json({
      message:"Server error!",
      error:err.message
    });

  }
}