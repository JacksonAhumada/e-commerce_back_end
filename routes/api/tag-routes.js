const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
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
    const tagsData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, ProductTag }]
    });

    if (!categoryData) {
      res.status(400).json({ message: 'There is no Tag with this id.' });
      return;
    }

    res.status(200).json(tagsData);
  } catch (error) {
    res.status(500).json(err);

  }
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body)
    .then((tag) => {
      if (req.body.tag.length) {
        const tagId = req.body.tag.map((tag) => {
          return {
            tag_id: tag.id,
            };
        });
        return Tag.bulkCreate(tagId);
      }
      res.status(200).jason(tag);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      return Tag.findAll({ where: { tag_id: req.params.id } });
    })
    .then((tag) => {
      const tagId = tag.map(({ tag_id }) => tag_id);
      const newTag = req.body.tagIds
        .filter((category_id) => !categoryId.includes(category_id))
        .map((category_id) => {
          return {
            tag_id: req.params.id,
            tag_id,
          };
        });
      const tagToRemove = tag
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);
      
      return Promise.all([
        Tag.destroy({ where: { id: tagToRemove } }),
        Tag.bulkCreate(newTag),
      ]);
    })
    .then((updatedTag) => res.json(updatedTag))
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
