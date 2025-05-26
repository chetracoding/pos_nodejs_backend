import models from '../models/index.js'
const { products, productCustomizes, user } = models
export default {
  getAll,
  getById,
  create,
  update,
  destroy,
}

async function getAll(req, res) {
  const options = { store_id: req.user.store_id, disabled: false }
  if (req.user.role_name === 'waiter') {
    options.is_active = true;
  }
  const resData = await products.find(options).populate('category_id product_customizes')
  res.send({ success: true, message: `Get all products successful.`, data: resData })
}
async function getById(req, res) {
  const product = await products.findOne({
    _id: req.params.id,
    store_id: req.user.store_id,
    disabled: false,
  })
  if (!product) {
    return res.status(404).send({ success: false, message: `Not Found.` })
  }
  return res.status(200).send({
    success: true,
    message: `Get product successful.`,
    data: product,
  })
}
async function create(req, res) {
  const productData = { ...req.body }
  productData.store_id = req.user.store_id
  productData.product_customizes = []
  const resProduct = await products.create(productData)
  req.body._id = resProduct.id
  for (const prodCus of req.body.product_customizes) {
    prodCus.product_id = resProduct.id
    const resProdCus = await productCustomizes.create(prodCus)
    productData.product_customizes.push(resProdCus.id)
  }
  await products.findByIdAndUpdate(resProduct.id, {
    product_customizes: productData.product_customizes,
  })
  res.send({
    success: true,
    message: `Product created successful.`,
    data: req.body,
  })
}
async function update(req, res) {
  const product = await products.findOne({
    _id: req.params.id,
    store_id: req.user.store_id,
    disabled: false,
  })
  if (!product) {
    return res.status(404).send({ success: false, message: `Not Found.` })
  }
  for (const prodCus of req.body.product_customizes) {
    if (prodCus.product_customize_id) {
      await productCustomizes.findByIdAndUpdate(
        prodCus.product_customize_id,
        prodCus
      )
    } else {
      const resProdCus = await productCustomizes.create({
        ...prodCus,
        product_id: req.params.id,
      })
      product.product_customizes.push(resProdCus.id)
    }
  }
  req.body.product_customizes = product.product_customizes
  await products.findByIdAndUpdate(req.params.id, req.body)
  return res.status(200).send({
    success: true,
    message: `Product updated successful.`,
    data: await products
      .findById(req.params.id)
      .populate('category_id product_customizes'),
  })
}
async function destroy(req, res) {
  const product = await products.findOneAndUpdate(
    {
      _id: req.params.id,
      store_id: req.user.store_id,
      disabled: false,
    },
    {
      disabled: true,
    }
  )
  if (!product) {
    return res.status(404).send({ success: false, message: `Not Found.` })
  }
  return res
    .status(200)
    .send({ success: true, message: `Product deleted successful.` })
}
