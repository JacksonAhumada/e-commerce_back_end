const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const category = await Category.findAll();
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
    }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }]
    });

    if (!categoryData) {
      res.status(400).json({ message: 'There is no category with this id.' });
      return;
    }

    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json(err);

  }
});

router.post('/', (req, res) => {
  // create a new category
  Category.create(req.body)
    .then((category) => {
      if (req.body.productIds.length) {
        const categoryTagIdArr = req.body.productIds.map((product_id) => {
          return {
            category_id: category.id,
            product_id,
          };
        });
        return Category.bulkCreate(categoryTagIdArr);
      }
      res.status(200).jason(category);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((category) => {
      return Category.findAll({ where: { category_id: req.params.id } });
    })
    .then((category) => {
      const categoryId = category.map(({ category_id }) => category_id);
      const newCategory = req.body.tagIds
        .filter((category_id) => !categoryId.includes(category_id))
        .map((category_id) => {
          return {
            category_id: req.params.id,
            category_id,
          };
        });
      const categoryIdsToRemove = category
        .filter(({ category_id }) => !req.body.tagIds.includes(category_id))
        .map(({ id }) => id);
      
      return Promise.all([
        Category.destroy({ where: { id: categoryIdsToRemove } }),
        Category.bulkCreate(newCategory),
      ]);
    })
    .then((updatedCategory) => res.json(updatedCategory))
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = router;
