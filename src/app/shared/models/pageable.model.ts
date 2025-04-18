
export class Pageable {

    // {
//     current_page": 1,
//     "data": [],
//     "first_page_url": "http://localhost/feria_api/public/api/products?page=1",
//     "from": null,
//     "last_page": 1,
//     "last_page_url": "http://localhost/feria_api/public/api/products?page=1",
//     "links": [
//         {
//             "url": null,
//             "label": "pagination.previous",
//             "active": false
//         },
//         {
//             "url": "http://localhost/feria_api/public/api/products?page=1",
//             "label": "1",
//             "active": true
//         },
//         {
//             "url": null,
//             "label": "pagination.next",
//             "active": false
//         }
//     ],
//     "next_page_url": null,
//     "path": "http://localhost/feria_api/public/api/products",
//     "per_page": 15,
//     "prev_page_url": null,
//     "to": null,
//     "total": 0
// }
    from: number;
    to: number;
    last_page: number;
    per_page: number;
    data: [];
    page = 0;
    current_page = 1;
    // The number of elements in the page
    // The total number of elements
    total = 0;

}
