import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {egretAnimations} from "@animations/egret-animations";
import {CartItem} from "@models/cartItem";

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss'],
    animations: egretAnimations
})
export class CheckoutComponent implements OnInit {
    public cart: CartItem[];
    public checkoutForm: FormGroup;
    public checkoutFormAlt: FormGroup;
    public hasAltAddress: boolean;
    public countries: any[];

    public total: number;
    public subTotal: number;
    public vat = 15;
    public shipping: any = 'Free';
    public paymentMethod: string;

    constructor(
        private fb: FormBuilder,
    ) {
        this.countries = [];
    }

    ngOnInit() {
        this.getCart();
        this.buildCheckoutForm();
    }

    calculateCost() {
        this.subTotal = 0;
        this.cart.forEach(item => {
            this.subTotal += (item.product.price * item.data.quantity)
        })
        this.total = this.subTotal + (this.subTotal * (15 / 100));
        if (this.shipping !== 'Free') {
            this.total += this.shipping;
        }
    }

    getCart() {

    }

    buildCheckoutForm() {
        this.checkoutForm = this.fb.group({
            country: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            company: [],
            address1: ['', Validators.required],
            address2: [],
            city: ['', Validators.required],
            zip: ['', Validators.required],
            phone: ['', Validators.required],
            email: ['', Validators.required]
        })

        this.checkoutFormAlt = this.fb.group({
            country: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            company: [],
            address1: ['', Validators.required],
            address2: [],
            city: ['', Validators.required],
            zip: ['', Validators.required],
            phone: ['', Validators.required],
            email: ['', Validators.required]
        })
    }


    placeOrder() {
        const billingAddress = this.checkoutForm.value;
        let shippingAddress;

        if (this.hasAltAddress) {
            shippingAddress = this.checkoutFormAlt.value;
        }

        console.log(billingAddress, shippingAddress, this.paymentMethod)
    }

}
