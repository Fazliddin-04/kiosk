const onModifierMaxAmount = (modifier, variantId, orderModifiers, setOrderModifiers) => {
  let isChanged = false
  const changedModifiers = orderModifiers.map((selModifier) => {
    if (
      selModifier.parent_id === modifier.id &&
      selModifier.modifier_id !== variantId &&
      selModifier.modifier_quantity > 0 &&
      !isChanged
    ) {
      isChanged = true
      return {
        ...selModifier,
        modifier_quantity: selModifier?.modifier_quantity - 1,
      }
    }
    if (
      selModifier.parent_id === modifier.modifier_id &&
      selModifier.modifier_id === variantId
    ) {
      return {
        ...selModifier,
        modifier_quantity:
          selModifier.modifier_quantity < modifier.max_amount
            ? selModifier.modifier_quantity + 1
            : selModifier.modifier_quantity,
      }
    } else {
      return selModifier
    }
  })
  setOrderModifiers(
    changedModifiers.filter((item) => item.modifier_quantity !== 0)
  )
}
export const onModifierChange = (checked, modifier, setOrderModifiers) => {
  if (checked) {
    const mockModifier = {
      modifier_id: modifier.id,
      modifier_price: modifier.price !== '' ? +modifier.price : 0,
      modifier_quantity: modifier?.min_amount || 1,
      parent_id: '',
      name: modifier?.title ? modifier?.title : modifier?.name,
      type: "single",
    }
    mockModifier && setOrderModifiers((prev) => [...prev, mockModifier])
  } else {
    if (!modifier.is_compulsory) {
      setOrderModifiers((prevState) =>
        prevState.filter((el) => el.modifier_id !== modifier.id)
      )
    }
  }
}
export const onGroupModifierChange = (checked, variant, modifier, orderModifiers, setOrderModifiers, modifiersQuantity, setModifiersQuantity) => {
  if (checked) {
    const groupModifier = modifiersQuantity.find(
      (item) => item.id === modifier.id
    )
    if (
      groupModifier.quantity < modifier.max_amount &&
      groupModifier.quantity !== modifier.max_amount
    ) {
      setModifiersQuantity((prev) =>
        prev.map((item) =>
          item.id === groupModifier.id
            ? {
              ...groupModifier,
              quantity: groupModifier.quantity + 1,
            }
            : item
        )
      )
    } else onModifierMaxAmount(modifier, variant.id, orderModifiers, setOrderModifiers)
    if (!orderModifiers.find((item) => item.modifier_id == variant.id)) {
      const mockModifier = {
        modifier_id: variant.id,
        modifier_price: variant.out_price !== '' ? +variant.out_price : 0,
        modifier_quantity: 1,
        parent_id: modifier.id,
        name: variant?.title ? variant?.title : variant?.name,
        type: "group",
      }
      setOrderModifiers((prev) => [...prev, mockModifier])
    }
  } else {
    const mockModifierQuantity = modifiersQuantity.find(
      (item) => item.id === modifier.id
    )
    const mockVariant = orderModifiers.find(
      (item) => item.modifier_id === variant.id
    )
    if (
      modifier.is_compulsory &&
      (mockModifierQuantity.quantity === modifier.min_amount || mockModifierQuantity.quantity - mockVariant.modifier_quantity < modifier.min_amount)
    ) {
      return
    } else {
      setOrderModifiers((prevState) =>
        prevState.filter((el) => el.modifier_id !== variant.id)
      )
      setModifiersQuantity((prev) =>
        prev.map((item) =>
          item.id === modifier.id
            ? {
              ...item,
              quantity:
                item.quantity > 0 ? item.quantity - 1 : item.quantity,
            }
            : item
        )
      )
    }
  }
}
export const onIncreaseModifierQuantity = (modifier, orderModifiers, setOrderModifiers) => {
  const mockModifier = orderModifiers.find(
    (item) => item.modifier_id === modifier.id
  )
  if (mockModifier && mockModifier.modifier_quantity < modifier.max_amount) {
    setOrderModifiers((prev) =>
      prev.map((item) =>
        item.modifier_id === mockModifier.modifier_id
          ? {
            ...mockModifier,
            modifier_quantity: mockModifier.modifier_quantity + 1,
          }
          : item
      )
    )
  }
}
export const onIncreaseModifierVariantQuantity = (variant, modifier, orderModifiers, setOrderModifiers, modifiersQuantity, setModifiersQuantity) => {
  const totalQuantity = modifiersQuantity.find(
    (item) => item.id === modifier.id
  )
  if (totalQuantity.quantity < modifier.max_amount) {
    setModifiersQuantity((prev) =>
      prev.map((item) =>
        item.id === totalQuantity.id
          ? {
            ...totalQuantity,
            quantity: totalQuantity.quantity + 1,
          }
          : item
      )
    )
  } else onModifierMaxAmount(modifier, variant.id, orderModifiers, setOrderModifiers)
  const mockModifier = orderModifiers.find(
    (item) => item.modifier_id === variant.id
  )
  if (mockModifier && mockModifier.modifier_quantity < modifier.max_amount) {
    setOrderModifiers((prev) =>
      prev.map((item) =>
        item.modifier_id === mockModifier.modifier_id
          ? {
            ...mockModifier,
            modifier_quantity: mockModifier.modifier_quantity + 1,
          }
          : item
      )
    )
  }
}
export const onDecreaseModifierQuantity = (modifier, orderModifiers, setOrderModifiers) => {
  const mockModifier = orderModifiers.find(
    (item) => item.modifier_id === modifier.id
  )
  if (mockModifier.modifier_quantity > modifier.min_amount) {
    setOrderModifiers((prev) =>
      prev.map((item) =>
        item.modifier_id === mockModifier.modifier_id
          ? {
            ...mockModifier,
            modifier_quantity: mockModifier.modifier_quantity - 1,
          }
          : item
      )
    )
  }
  if (mockModifier.modifier_quantity && modifier.min_amount == 0) {
    setOrderModifiers((prev) =>
      prev.filter((item) => item.modifier_id !== modifier.id)
    )
  }
}
export const onDecreaseModifierVariantQuantity = (variant, modifier, orderModifiers, setOrderModifiers, modifiersQuantity, setModifiersQuantity) => {
  const mockModifier = orderModifiers.find(
    (item) => item.modifier_id === variant.id
  )
  if (mockModifier && mockModifier.modifier_quantity > modifier.min_amount) {
    const totalQuantity = modifiersQuantity.find(
      (item) => item.id === modifier.id
    )
    setModifiersQuantity((prev) =>
      prev.map((item) =>
        item.id === totalQuantity.id
          ? {
            ...totalQuantity,
            quantity: totalQuantity.quantity - 1,
          }
          : item
      )
    )
    setOrderModifiers((prev) =>
      prev.map((item) =>
        item.modifier_id === mockModifier.modifier_id
          ? {
            ...mockModifier,
            modifier_quantity: mockModifier.modifier_quantity - 1,
          }
          : item
      )
    )
  }
}