import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface EventTicket {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  category: string;
  availableSeats: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  categories = ['All', 'Concerts', 'Sports', 'Theater', 'Tech'];
  selectedCategory = 'All';

  events: EventTicket[] = [
    {
      id: 1,
      title: 'Enrique Iglesias Live in Colombo',
      date: 'Oct 15, 2026',
      time: '07:00 PM',
      location: 'Nelum Pokuna, Colombo',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1540039155732-d674d6e3f0be?q=80&w=600&auto=format&fit=crop',
      category: 'Concerts',
      availableSeats: 120
    },
    {
      id: 2,
      title: 'LPL T20 Final Match',
      date: 'Nov 02, 2026',
      time: '03:30 PM',
      location: 'R. Premadasa Stadium',
      price: 5000,
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop',
      category: 'Sports',
      availableSeats: 45
    },
    {
      id: 3,
      title: 'DevFest Sri Lanka 2026',
      date: 'Dec 10, 2026',
      time: '09:00 AM',
      location: 'BMICH, Colombo',
      price: 2500,
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=600&auto=format&fit=crop',
      category: 'Tech',
      availableSeats: 300
    },
    {
      id: 4,
      title: 'Standup Comedy Night',
      date: 'Dec 25, 2026',
      time: '08:00 PM',
      location: 'Lionel Wendt Theatre',
      price: 3000,
      image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=600&auto=format&fit=crop',
      category: 'Theater',
      availableSeats: 12
    }
  ];

  get filteredEvents() {
    if (this.selectedCategory === 'All') {
      return this.events;
    }
    return this.events.filter(e => e.category === this.selectedCategory);
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
  }
}
