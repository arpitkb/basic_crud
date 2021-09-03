
// var toastTrigger = document.getElementById('liveToastBtn')
const toastLiveExample = document.getElementById('liveToast')
// if (toastTrigger) {
//     toastTrigger.addEventListener('click', function () {
//         var toast = new bootstrap.Toast(toastLiveExample)

//         toast.show()
//     })
// }
const toast = new bootstrap.Toast(toastLiveExample)
toast.show()

// var toastElList = [].slice.call(document.querySelectorAll('.toast'))
// var toastList = toastElList.map(function (toastEl) {
//     return new bootstrap.Toast(toastEl, option)
// })