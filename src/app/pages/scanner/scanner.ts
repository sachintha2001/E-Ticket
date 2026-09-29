import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss'
})
export class Scanner implements OnInit {
  hasDevices = false;
  hasPermission = false;
  qrResultString: string | null = null;
  scanStatus: 'idle' | 'success' | 'error' | 'already_scanned' = 'idle';
  parsedData: any = null;
  
  private firestore = inject(Firestore);

  ngOnInit(): void {}

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.hasDevices = true;
  }

  onHasPermission(has: boolean): void {
    this.hasPermission = has;
  }

  async handleQrCodeResult(resultString: string) {
    if (this.scanStatus !== 'idle') return;

    this.qrResultString = resultString;
    console.log("Scanned:", resultString);

    try {
      this.parsedData = JSON.parse(resultString);
      const ticketId = this.parsedData.ticketId;

      if (!ticketId) {
        this.scanStatus = 'error';
        return;
      }

      // Validate against Firestore Database
      const ticketRef = doc(this.firestore, 'tickets', ticketId);
      const docSnap = await getDoc(ticketRef);
      
      if (docSnap.exists()) {
        const ticketData = docSnap.data();
        
        if (ticketData['isScanned']) {
          this.scanStatus = 'already_scanned';
        } else {
          // Mark as scanned
          await updateDoc(ticketRef, { 
            isScanned: true,
            scannedAt: new Date().toISOString()
          });
          this.scanStatus = 'success';
        }
      } else {
        this.scanStatus = 'error'; // Ticket not found
      }
      
      setTimeout(() => {
        this.scanStatus = 'idle';
        this.qrResultString = null;
        this.parsedData = null;
      }, 4000);

    } catch (e) {
      console.error(e);
      this.scanStatus = 'error';
      setTimeout(() => { this.scanStatus = 'idle'; }, 4000);
    }
  }
}
