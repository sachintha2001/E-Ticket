import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../../core/services/auth';
import { environment } from '../../../environments/environment';

// Declare payhere globally since it is loaded via external script
declare var payhere: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  isProcessing = false;
  paymentSuccess = false;
  paymentError: string | null = null;

  // Ticket Pricing Logic
  basePrice = 5000;
  ticketQuantity = 1;

  billingForm = this.fb.group({
    firstName: ['Saman', Validators.required],
    lastName: ['Kumara', Validators.required],
    phone: ['0771234567', Validators.required],
    city: ['Colombo', Validators.required]
  });

  get totalAmount(): number {
    return this.basePrice * this.ticketQuantity;
  }

  increaseQuantity() {
    if (this.ticketQuantity < 10) { 
      this.ticketQuantity++;
    }
  }

  decreaseQuantity() {
    if (this.ticketQuantity > 1) { 
      this.ticketQuantity--;
    }
  }

  ngOnInit() {
    this.loadPayHereScript();
    this.setupPayHereCallbacks();
  }

  private loadPayHereScript() {
    if (!document.getElementById('payhere-js')) {
      const script = document.createElement('script');
      script.id = 'payhere-js';
      script.src = 'https://www.payhere.lk/lib/payhere.js';
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
  }

  private setupPayHereCallbacks() {
    window.addEventListener('payhere-completed', async (e: any) => {
      console.log("Payment completed. OrderID:" + e.detail);
      this.isProcessing = false;
      
      const formValues = this.billingForm.value;
      const orderId = e.detail;
      const currentUser = this.authService.currentUser();
      const userEmail = currentUser ? currentUser.email : 'guest@example.com';

      // Save Ticket to Firestore
      const ticketPayload = {
        id: orderId,
        userEmail: userEmail,
        eventName: "Live Rock Concert",
        date: "Oct 15, 2026",
        time: "07:00 PM",
        location: "Nelum Pokuna, Colombo",
        quantity: this.ticketQuantity,
        isScanned: false,
        purchasedAt: new Date().toISOString()
      };

      try {
        const ticketRef = doc(this.firestore, 'tickets', orderId);
        await setDoc(ticketRef, ticketPayload);
        
        this.paymentSuccess = true;
        this.paymentError = null;
        
        setTimeout(() => {
          this.router.navigate(['/my-tickets']);
        }, 3000);
      } catch (err) {
        console.error("Failed to save ticket to Firestore:", err);
        this.paymentError = "Payment succeeded, but failed to generate ticket. Please contact support.";
      }
    });

    window.addEventListener('payhere-dismissed', () => {
      console.log("Payment dismissed by user");
      this.isProcessing = false;
    });

    window.addEventListener('payhere-error', (e: any) => {
      console.log("Payment error: " + e.detail);
      this.isProcessing = false;
      this.paymentError = "Payment failed or was rejected. Please try again.";
    });
  }

  payWithPayHere() {
    if (this.billingForm.valid) {
      this.isProcessing = true;
      this.paymentError = null;

      const formValues = this.billingForm.value;
      const currentUser = this.authService.currentUser();
      const userEmail = currentUser ? currentUser.email : 'guest@example.com';
      
      // Use Environment Variables for Security
      const merchantId = environment.payhere.merchantId;
      const merchantSecret = environment.payhere.merchantSecret;
      
      const orderId = "Ticket_" + new Date().getTime();
      const amountStr = this.totalAmount.toString();
      const currency = "LKR";
      
      // GENERATE MD5 HASH
      const hashedSecret = CryptoJS.MD5(merchantSecret).toString().toUpperCase();
      const amountFormatted = parseFloat(amountStr).toFixed(2);
      const hashString = merchantId + orderId + amountFormatted + currency + hashedSecret;
      const hash = CryptoJS.MD5(hashString).toString().toUpperCase();

      const currentDomain = window.location.origin;

      const payment = {
        "sandbox": true, 
        "merchant_id": merchantId,
        "return_url": `${currentDomain}/checkout`, 
        "cancel_url": `${currentDomain}/checkout`,
        "notify_url": "http://api.yourdomain.com/payhere-notify", 
        "order_id": orderId,
        "items": `Live Rock Concert - ${this.ticketQuantity} Tickets`,
        "amount": amountFormatted,
        "currency": currency,
        "hash": hash, 
        "first_name": formValues.firstName,
        "last_name": formValues.lastName,
        "email": userEmail,
        "phone": formValues.phone,
        "address": "No 1, Galle Road",
        "city": formValues.city,
        "country": "Sri Lanka",
        "custom_1": this.ticketQuantity.toString() // Pass quantity as custom data
      };

      if (typeof payhere !== 'undefined') {
        payhere.onCompleted = function onCompleted(orderId: string) {
            window.dispatchEvent(new CustomEvent('payhere-completed', { detail: orderId }));
        };
        payhere.onDismissed = function onDismissed() {
            window.dispatchEvent(new Event('payhere-dismissed'));
        };
        payhere.onError = function onError(error: string) {
            window.dispatchEvent(new CustomEvent('payhere-error', { detail: error }));
        };

        payhere.startPayment(payment);
      } else {
        this.paymentError = "Payment gateway is loading... Please try again in a few seconds.";
        this.isProcessing = false;
      }
    }
  }
}
