const products = [
    {
        id : 1,
        image : 'resources/images/1.png',
        name : 'T-Shirt',
        price : 100
    },
    {
        id : 2,
        image : 'resources/images/2.png',
        name : 'Quarter-Zip Sweatshirt',
        price : 200
    },
    {
        id : 3,
        image : 'resources/images/3.png',
        name : 'Lightweight Hoodie',
        price : 130
    },
    {
        id : 4,
        image : 'resources/images/4.png',
        name : 'Zip Hoodie',
        price : 110
    }
];

$(function () {

    $(`.nav__item a`).each((index, element) => {
        if (element.href === location.href) $(element).parent().addClass("nav__item--current")
    })

    if (typeof (Storage) !== 'undefined') {
        console.log('Storage compatible')
    } else {
        console.log('Storage no es compatible')
    }

    $('#CartOpen').on('click', function () {
        $('#CartBox').addClass('cart--show')
    })
    $('#CartClose').on('click', function () {
        $($(this).data("target")).removeClass('cart--show')
    })
    $('#SearchProducts').on('keyup', function() {
        let value = this.value
        let productsFiltered = !value ? products : products.filter(product => product.name.toLowerCase().includes(value.toLowerCase()));
        fillProducts(productsFiltered)
    })
    $('.nav__item--options').on('click', function () {
        let target = $(this).data('target')
        $(target).toggle()
    })

    fillProducts(products)

    let cartProducts = getCartProducts()
    fillCartProducts(cartProducts)
})

function fillProducts(items) {
    let elementProducts = $('#Products')
    elementProducts.empty()

    items.forEach(element => {
        let elementProduct = $(`<div class="card card--product">
                                    <div class="card__image">
                                        <img class="image" src="${element.image}" alt="imagen" width="250" height="250">
                                        <span class="over-content over-content--right" style="font-size: 30px;"><a href="javascript:void(0)" class="link-add add-to-cart" data-id="${element.id}"><i class="fa-solid fa-circle-plus"></i></a></span>
                                    </div>
                                    <div class="card__body row">
                                        <p class="text">${element.name}</p>
                                        <span class="amount amount--dollar">${element.price}</span>
                                    </div>
                                </div>`)
        elementProducts.append(elementProduct)
    });

    $('.add-to-cart').on('click', function () { addCartProduct($(this).data('id')) })
}

function getCartProducts() {
    let strCartProducts = sessionStorage.getItem('CartProducts')
    if (!strCartProducts) {
        strCartProducts = JSON.stringify([])
        sessionStorage.setItem('CartProducts', strCartProducts)
    }
    return JSON.parse(strCartProducts);
}

function fillCartProducts(items) {
    let elementCartProducts = $('#CartProducts')
    elementCartProducts.empty()

    items.forEach(element => {
        let elementCartProduct = $(`<div class="card card--simple" data-id="${element.id}">
                                        <div class="card__image">
                                            <img class="image" src="${element.image}" alt="imagen" width="50" height="50">
                                            <span class="over-content over-content--cart-product" style="font-size: 20px;"><a href="javascript:void(0)" class="link-remove remove-to-cart" data-id="${element.id}"><i class="fa-solid fa-circle-minus"></i></a></span>
                                        </div>
                                        <div class="card__body">
                                            <p class="text">${element.name}</p>
                                            <span class="amount amount--dollar">${element.price}</span>
                                        </div>
                                        <div class="card__footer">
                                            <span class="quantity">
                                                <input type="range" min="1" max="100" step="1" value="${element.quantity}"/>
                                                <button class="minus"><i class="fa-solid fa-minus"></i></button>
                                                <input class="qty-product" type="text" value="0"/>
                                                <button class="plus"><i class="fa-solid fa-plus"></i></button>
                                            </span>
                                        </div>
                                    </div>`)
        let elementRangeQtyProduct = elementCartProduct.find('.quantity input[type="range"]')
        let elementQtyProduct = elementCartProduct.find('.qty-product')
        element.quantity = +elementRangeQtyProduct.val()
        elementQtyProduct.val(element.quantity)
        elementCartProducts.append(elementCartProduct)
    })

    $('.remove-to-cart').on('click', function () { 
        let id = $(this).data('id')
        let cartProducts = getCartProducts()
        let newCartProducts = cartProducts.filter(p => p.id !== id)

        fillCartProducts(newCartProducts)

        sessionStorage.setItem('CartProducts', JSON.stringify(newCartProducts))
    })

    $('.minus').on('click', function () {
        let elementCard = $(this).parent().parent().parent()
        let id = elementCard.data('id')
        removeCartProduct(id)
    })

    $('.plus').on('click', function () {
        let elementCard = $(this).parent().parent().parent()
        let id = elementCard.data('id')
        addCartProduct(id)
    })

    $('.qty-product').on('change', function () {
        let elementRangeQtyProduct = $(this).parent().find('input[type="range"]')
        let value = this.value
        elementRangeQtyProduct.val(value)
        this.value = elementRangeQtyProduct.val()

        let elementCard = $(this).parent().parent().parent()
        let id = elementCard.data('id')


        let cartProducts = getCartProducts()
        let product = cartProducts.filter(p => p.id === id)[0]
        product.quantity = +this.value
        sessionStorage.setItem('CartProducts', JSON.stringify(cartProducts))

        calculateTotalsCartProducts(cartProducts)
        countCartProducts(cartProducts)
    })

    calculateTotalsCartProducts(items)
    countCartProducts(items)
}

function addCartProduct(id) {
    if (!id) return

    let cartProducts = getCartProducts()
    let product = cartProducts.filter(p => p.id === id)[0]
    if (!product) {
        product = products.filter(p => p.id === id)[0]
        if (!product) return
        product = { ...product }
        product.quantity = 1
        cartProducts.push(product)
    } else {
        product.quantity++
    }

    fillCartProducts(cartProducts)

    sessionStorage.setItem('CartProducts', JSON.stringify(cartProducts))
}

function removeCartProduct(id) {
    if (!id) return

    let cartProducts = getCartProducts()
    let product = cartProducts.filter(p => p.id === id)[0]
    if (!product) return
    product.quantity--

    fillCartProducts(cartProducts)

    sessionStorage.setItem('CartProducts', JSON.stringify(cartProducts))
}

function calculateTotalsCartProducts (items) {
    let total = items.reduce((accumulator, currentValue) => {
        return accumulator + (currentValue.price * currentValue.quantity)
    }, 0)
    $('#Total').text(total)
}

function countCartProducts (items) {
    let qty = items.reduce((accumulator, currentValue) => {        
        return accumulator + currentValue.quantity
    }, 0)
    if (qty === 0) {
        $('#Qty').hide()
        return
    }
    $('#Qty').show()
    if (qty > 99) {
        $('#Qty').text('+99')
        return
    }
    $('#Qty').text(qty)
}

function getProducts() {
    let strProducts = localStorage.getItem('Products')
    if (!strProducts) {
        strProducts = JSON.stringify([])
        localStorage.setItem('Products', strProducts)
    }
    return JSON.parse(strProducts);
}