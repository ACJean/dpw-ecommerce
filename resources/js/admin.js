$(async function () {

    await fillProductsAdmin(getProducts())

});

const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

async function fillProductsAdmin(items, idEdit = 0) {
    let elementAdminProducts = $('#AdminProducts')
    elementAdminProducts.empty()

    let item = items.filter(i => i.id === idEdit)[0]
    items = items.filter(i => i.id !== idEdit)
    let elementAdminCreateProduct
    if (item) {
        elementAdminCreateProduct = $(`<form id="FrmProducto" class="table-card__row" method="post" enctype="multipart/form-data">
                                        <input name="id" type="hidden" value="${item.id}">
                                        <span class="table-card__column table-card__column--index">${item.id}</span>
                                        <span class="table-card__column">
                                            <input id="Img" name="img" type="file" accept="image/*" required="true" hidden>
                                            <label class="image-label" for="Img" id="file-1-preview">
                                                <img id="ImgForm" class="image image--circle" src="" alt="Seleccionar Imagen" width="64" height="64">
                                            </label>
                                        </span>
                                        <span class="table-card__column">
                                            <input name="name" class="input" type="text" value="${item.name}" placeholder="Nombre Producto" required="true" autocomplete="off">
                                        </span>
                                        <span class="table-card__column">
                                            <span class="input--amount">$</span>
                                            <input name="price" class="input input--amount" type="number" value="${item.price}" min=".00" step=".01" placeholder="Precio" required="true" autocomplete="off">
                                        </span>
                                        <span class="table-card__column">
                                            <input class="btn btn--fill btn--success" type="submit" value="Actualizar">
                                            <input id="CancelarEdicion" class="btn btn--fill btn--cancel" type="button" value="Cancelar">
                                        </span>
                                    </form>`)
    } else {
        elementAdminCreateProduct = $(`<form id="FrmProducto" class="table-card__row" method="post" enctype="multipart/form-data">
                                        <input name="id" type="hidden" value="0">
                                        <span class="table-card__column table-card__column--index">-</span>
                                        <span class="table-card__column">
                                            <input id="Img" name="img" type="file" accept="image/*" required="true" hidden>
                                            <label class="image-label" for="Img" id="file-1-preview">
                                                <img id="ImgForm" class="image image--circle" src="resources/images/default.jpg" alt="Seleccionar Imagen" required="true" width="64" height="64">
                                            </label>
                                        </span>
                                        <span class="table-card__column">
                                            <input name="name" class="input" type="text" placeholder="Nombre Producto" required="true" autocomplete="off">
                                        </span>
                                        <span class="table-card__column">
                                            <span class="input--amount">$</span>
                                            <input name="price" class="input input--amount" type="number" min=".00" step=".01" placeholder="Precio" required="true" autocomplete="off">
                                        </span>
                                        <span class="table-card__column">
                                            <input class="btn btn--fill btn--success" type="submit" value="Crear">
                                        </span>
                                    </form>`)
    }
    elementAdminProducts.append(elementAdminCreateProduct)
    if (item) {
        let fileInput = document.getElementById('Img')
        let file = dataURLtoFile(item.image,`${item.name}.png`);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        $('#ImgForm').attr('src', item.image)
    }

    items.forEach(element => {
        let elementAdminProduct = $(`<div class="table-card__row">
                                        <span class="table-card__column table-card__column--index">${element.id}</span>
                                        <span class="table-card__column">
                                            <img class="image image--circle" src="${element.image}" alt="T-Shirt" width="64" height="64">
                                        </span>
                                        <span class="table-card__column">${element.name}</span>
                                        <span class="table-card__column">${element.price}</span>
                                        <span class="table-card__column">
                                            <a class="control control--update adm-product-update" href="javascript:void(0)" data-id="${element.id}"><i class="fa-solid fa-pencil"></i></a>
                                            <a class="control control--delete adm-product-delete" href="javascript:void(0)" data-id="${element.id}"><i class="fa-solid fa-trash-can"></i></a>
                                        </span>
                                    </div>`)
        elementAdminProducts.append(elementAdminProduct)
    });

    $('#Img').on('change', async function (e) {
        const file = e.target.files[0];
        const base64 = await convertBase64(file);
        $('#ImgForm').attr('src', base64)
    })

    $('#FrmProducto').on('submit', async function (event) {
        event.preventDefault()
        let products = getProducts()
        const formData = new FormData(event.target)
        let id = +formData.get('id')
        let product = products.filter(p => p.id === id)[0]
        if (product) {
            product.image = await convertBase64(formData.get('img'))
            product.name = formData.get('name')
            product.price = +formData.get('price')
        } else {
            if (id === 0 && products.length === 0) id = staticProducts[staticProducts.length -1].id + 1
            if (id === 0 && products.length > 0) id = products[products.length - 1].id + 1
            let product = {
                id : id,
                image : await convertBase64(formData.get('img')),
                name : formData.get('name'),
                price : +formData.get('price')
            }
            products.push(product)
        }
        sessionStorage.setItem('Products', JSON.stringify(products))

        await fillProductsAdmin(products)

        return false
    })

    $('.adm-product-update').on('click', async function () {
        let id = $(this).data('id')
        let products = getProducts()
        await fillProductsAdmin(products, id)
    })

    $('#CancelarEdicion').on('click', async function () {
        let products = getProducts()
        await fillProductsAdmin(products)
    })

    $('.adm-product-delete').on('click', async function () {
        let id = $(this).data('id')
        let products = getProducts().filter(p => p.id !== id);

        sessionStorage.setItem('Products', JSON.stringify(products))

        await fillProductsAdmin(products, id)
    })
}

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}