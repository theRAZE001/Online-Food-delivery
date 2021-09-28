const btn = document.querySelectorAll('.add-to-cart');
const toast = document.querySelector('#liveToast');
const updateQty = document.querySelector('#cartCounter');
const deleteitem = document.querySelectorAll('#delete-item');
const increaseitem = document.querySelectorAll('.increase-qty');
const decreaseitem = document.querySelectorAll('.decrease-qty');
const totalPrice = document.querySelector('#total-price');
const itemCounter = document.querySelectorAll("#itemcounter");
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()


const mainNavLinks = document.querySelectorAll(".main-nav-link")
console.log(mainNavLinks.length)
for (let link of mainNavLinks) {
    if (window.location.href === link.href) {
        console.log(link.href)
        console.log(window.location.href)
        link.classList.add('active')
    }
}

for (let but of btn) {
    but.addEventListener('click', (e) => {
        let product = JSON.parse(but.dataset.product);
        // // const options = {
        // //     method: 'POST',
        // //     headers: {
        // //         'Content-Type': 'application/json'
        // //     },
        // //     body: JSON.stringify(product)
        // // };
        // // fetch('/cart', options)
        axios.post('/add-to-cart', product).then(res => {
            updateQty.innerText = res.data.totalQty
        });
        document.querySelector('.toast-body').innerText = `${product.name} added to cart`;
        let viewToast = new bootstrap.Toast(toast)
        viewToast.show()
    })
}
// for (let inr of increaseitem) {
//     inr.addEventListener('click', () => {
//         let item = JSON.parse(inr.dataset.item);
//         console.log(item)
//         axios.post('/increase-qty', item).then(res => {
//             itemCounter.innerText = res.data.qty;
//             totalPrice.innerText = res.data.totalPrice;
//             updateQty.innerText = res.data.totalQty;
//         })
//     })
// }
// for (let dec of decreaseitem) {
//     dec.addEventListener('click', () => {
//         let item = JSON.parse(dec.dataset.item);
//         console.log(item)
//         axios.post('/decrease-qty', item).then(res => {
//             itemCounter.innerText = res.data.qty;
//             totalPrice.innerText = res.data.totalPrice;
//             updateQty.innerText = res.data.totalQty;
//         })
//     })
// }

for (let del of deleteitem) {
    del.addEventListener('click', (e) => {
        e.preventDefault();
    });
}

const orderStatus = document.querySelectorAll('#orderStatus');
const hiddenInput = document.querySelector('#hiddenInput');
const userOrderStatus = document.querySelectorAll('#userOrderStatus');
const order = hiddenInput ? hiddenInput.value : null;
const orderObject = JSON.parse(order)
const time = document.createElement('small')


for (let status of userOrderStatus) {
    let allStatus = status.dataset.status
    let tableOrderStatus = document.createElement('span');
    tableOrderStatus.innerText = allStatus;
    status.appendChild(tableOrderStatus);
}
for (let status of orderStatus) {
    let step = status.dataset.step;
    if (step === orderObject.orderStatus) {
        status.classList.add('text-success')
        time.innerText = moment(orderObject.updatedAt).format('MMM Do, HH:MM a');;
        status.appendChild(time);
        break
    } else {
        status.classList.add('text-secondary')
    }
}


let socket = io()
if (order) {
    socket.emit('join', `order_${orderObject._id}`)
}

socket.on('orderUpdated', (data) => {
    const updateOrder = { ...orderObject }
    updateOrder.orderStatus = data.status;
    document.querySelector("#placed").classList.remove('text-success')

    for (let status of orderStatus) {
        status.classList.remove('text-success')
        status.classList.remove('text-secondary')
    }
    for (let status of orderStatus) {
        let step = status.dataset.step;
        console.log("update" + updateOrder.orderStatus)
        console.log("data-step" + step)
        if (step === updateOrder.orderStatus) {
            status.classList.add('text-success')
            time.innerText = moment(updateOrder.updatedAt).format('MMM Do, HH:MM a');
            status.appendChild(time);
            break
        } else {
            status.classList.add('text-secondary')
        }
    }
})

var stripe = Stripe('pk_test_51JXpHPSFncQ5LOCfCWQEaZEW0ZKQOgRrv7EcCAuMdTUyxV5LiuncN24rZTMrVt1CZo4LLg68MS2oS3PqGGC77vhm00cUmAs78r');
const paymentType = document.querySelector('#paymentType')
let card = null
const label = document.querySelector('#cardLabel')
if (paymentType) {
    paymentType.addEventListener('change', (e) => {

        if (e.target.value === 'card') {
            const elements = stripe.elements()
            card = elements.create('card', {
                style: {
                    base: {
                        iconColor: '#c4f0ff',
                        color: '#FD5717',
                        fontWeight: '500',
                        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                        fontSize: '16px',
                        fontSmoothing: 'antialiased',
                        ':-webkit-autofill': {
                            color: '#fce883',
                        },
                        '::placeholder': {
                            color: '#B4B4B4',
                        },
                    },
                    invalid: {
                        iconColor: '#FFC7EE',
                        color: '#FFC7EE',
                    },
                }, hidePostalCode: true
            });
            card.mount('#card-element')
            label.innerText = "Enter Card Details"
            document.querySelector('#card-element').classList.add('border')
            document.querySelector('#card-element').classList.add('rounded')
            document.querySelector('#card-element').classList.add('p-2')
        } else {
            document.querySelector('#card-element').classList.remove('border')
            document.querySelector('#card-element').classList.remove('rounded')
            document.querySelector('#card-element').classList.remove('p-2')
            label.innerText = ""
            card.destroy();
        }
    })
}

const orderForm = document.querySelector('#orderForm')
const alert = document.querySelector("#orderAlert")
if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let formData = new FormData(orderForm);
        let formObject = {}
        for (let [key, value] of formData.entries()) {
            formObject[key] = value
        }
        if (!card) {
            axios.post('/order/confirm-order', formObject).then((res) => {
                if (!res.data.err) {
                    alert.classList.remove('alert-warning');
                    alert.classList.remove('text-danger')
                    alert.classList.add("alert")
                    alert.classList.add("alert-primary")
                    alert.innerText = res.data.message;
                    setTimeout(() => {
                        window.location.href = '/users/orders'
                    }, 1500)
                } else {
                    alert.classList.add("alert")
                    alert.classList.add("alert-warning")
                    alert.classList.add("text-danger")
                    alert.innerText = res.data.err;
                    orderForm.phone.value = ''
                }
                return;
            }).catch((err) => {
                console.log(err)
            })
        } else {
            stripe.createToken(card).then(result => {
                formObject.stripeToken = result.token.id;
                axios.post('/order/confirm-order', formObject).then((res) => {
                    if (!res.data.err) {
                        alert.classList.add("alert")
                        alert.classList.add("alert-primary")
                        alert.innerText = res.data.message;
                        setTimeout(() => {
                            window.location.href = '/users/orders'
                        }, 1500)
                    } else {
                        alert.classList.add("alert")
                        alert.classList.add("alert-warning")
                        alert.classList.add("text-danger")
                        alert.innerText = res.data.err;
                        orderForm.phone.value = ''
                    }
                    return;
                }).catch((err) => {
                    console.log(err)
                })
            }).catch((err) => {
                console.log(err)
            })
        }
    })
}