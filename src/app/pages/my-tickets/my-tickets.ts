import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { AuthService } from '../../core/services/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

interface PurchasedTicket {
  id: string;
  userEmail: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  quantity: number;
  isScanned?: boolean;
  qrData?: string;
}

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.scss'
})
export class MyTickets implements OnInit {
  tickets: PurchasedTicket[] = [];
  isLoading = true;
  private authService = inject(AuthService);
  private firestore = inject(Firestore);

  ngOnInit() {
    this.fetchTicketsFromDatabase();
  }

  async fetchTicketsFromDatabase() {
    const currentUser = this.authService.currentUser();
    const userEmail = currentUser ? currentUser.email : null; 
    
    if (!userEmail) {
      this.isLoading = false;
      return;
    }

    try {
      const ticketsRef = collection(this.firestore, 'tickets');
      const q = query(ticketsRef, where("userEmail", "==", userEmail));
      const querySnapshot = await getDocs(q);
      
      this.tickets = querySnapshot.docs.map(doc => {
        const data = doc.data() as PurchasedTicket;
        return {
          ...data,
          qrData: JSON.stringify({ ticketId: data.id, seats: data.quantity })
        };
      });
      
      this.isLoading = false;
    } catch (err) {
      console.error("Error fetching tickets from Firestore:", err);
      this.isLoading = false;
    }
  }
}
