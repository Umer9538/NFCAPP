/**
 * NFC Service
 * Handle NFC operations and scanning
 */

import { Platform, Alert } from 'react-native';

// Try to import NFC manager, but handle Expo Go gracefully
let NfcManager: any = null;
let NfcTech: any = null;
let Ndef: any = null;

try {
  const nfcModule = require('react-native-nfc-manager');
  NfcManager = nfcModule.default;
  NfcTech = nfcModule.NfcTech;
  Ndef = nfcModule.Ndef;
} catch (error) {
  console.warn('NFC Manager not available - running in mock mode for Expo Go');
}

export interface NFCTag {
  id: string;
  type: string;
  data?: string;
}

export interface NFCData {
  nfcId: string;
  userId: string;
  profileUrl: string;
  timestamp: string;
}

export interface NFCWriteOptions {
  makeReadOnly?: boolean;
  timeout?: number;
}

class NFCService {
  private isInitialized = false;
  private isMockMode = NfcManager === null;

  /**
   * Initialize NFC Manager
   */
  async init(): Promise<boolean> {
    if (this.isInitialized) return true;

    // Mock mode for Expo Go
    if (this.isMockMode) {
      console.log('Running in mock NFC mode (Expo Go)');
      this.isInitialized = true;
      return true;
    }

    try {
      const supported = await NfcManager.isSupported();
      if (!supported) {
        console.warn('NFC is not supported on this device');
        return false;
      }

      await NfcManager.start();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('NFC initialization error:', error);
      return false;
    }
  }

  /**
   * Check if NFC is available and enabled
   */
  async isNFCAvailable(): Promise<boolean> {
    // Mock mode for Expo Go
    if (this.isMockMode) {
      return true;
    }

    try {
      const supported = await NfcManager.isSupported();
      if (!supported) return false;

      const enabled = await NfcManager.isEnabled();
      return enabled;
    } catch (error) {
      console.error('NFC availability check error:', error);
      return false;
    }
  }

  /**
   * Request NFC permissions (Android)
   */
  async requestPermissions(): Promise<boolean> {
    // Mock mode for Expo Go
    if (this.isMockMode) {
      return true;
    }

    if (Platform.OS === 'ios') {
      // iOS handles NFC permissions automatically
      return true;
    }

    try {
      const enabled = await NfcManager.isEnabled();
      if (!enabled) {
        Alert.alert(
          'NFC Disabled',
          'Please enable NFC in your device settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => NfcManager.goToNfcSetting(),
            },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('NFC permission error:', error);
      return false;
    }
  }

  /**
   * Start NFC scanning
   */
  async startScanning(
    onTagDiscovered: (tag: NFCTag) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    // Mock mode for Expo Go - show error instead of auto-scanning
    if (this.isMockMode) {
      console.log('NFC not available - running in Expo Go or NFC module not loaded');
      if (onError) {
        onError(new Error('NFC scanning requires a production build. Please build the app with EAS Build or use a development build to test NFC functionality.'));
      }
      return;
    }

    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        const initialized = await this.init();
        if (!initialized) {
          throw new Error('Failed to initialize NFC');
        }
      }

      // Check availability
      const available = await this.isNFCAvailable();
      if (!available) {
        throw new Error('NFC is not available or enabled');
      }

      // Register tag event listener
      await NfcManager.registerTagEvent();

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Read tag
      const tag = await NfcManager.getTag();
      if (tag) {
        const nfcTag: NFCTag = {
          id: tag.id || '',
          type: tag.techTypes?.[0] || 'unknown',
          data: this.parseNdefData(tag),
        };
        onTagDiscovered(nfcTag);
      }
    } catch (error) {
      console.error('NFC scanning error:', error);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      // Always cleanup
      this.stopScanning();
    }
  }

  /**
   * Stop NFC scanning
   */
  async stopScanning(): Promise<void> {
    // Mock mode - no-op
    if (this.isMockMode) {
      return;
    }

    try {
      await NfcManager.cancelTechnologyRequest();
      NfcManager.unregisterTagEvent();
    } catch (error) {
      console.error('NFC stop scanning error:', error);
    }
  }

  /**
   * Write data to NFC tag
   */
  async writeToNFC(data: string): Promise<boolean> {
    // Mock mode
    if (this.isMockMode) {
      console.log('Mock NFC write:', data);
      return true;
    }

    try {
      if (!this.isInitialized) {
        await this.init();
      }

      await NfcManager.requestTechnology(NfcTech.Ndef);

      const bytes = Ndef.encodeMessage([Ndef.textRecord(data)]);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      return true;
    } catch (error) {
      console.error('NFC write error:', error);
      return false;
    } finally {
      await this.stopScanning();
    }
  }

  /**
   * Read data from NFC tag
   */
  async readFromNFC(): Promise<string | null> {
    // Mock mode
    if (this.isMockMode) {
      console.log('Mock NFC read');
      return 'MedGuard Emergency Profile';
    }

    try {
      if (!this.isInitialized) {
        await this.init();
      }

      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      return this.parseNdefData(tag) || null;
    } catch (error) {
      console.error('NFC read error:', error);
      return null;
    } finally {
      await this.stopScanning();
    }
  }

  /**
   * Parse NDEF data from tag
   */
  private parseNdefData(tag: any): string | undefined {
    try {
      if (!tag?.ndefMessage || tag.ndefMessage.length === 0) {
        return undefined;
      }

      const ndefRecord = tag.ndefMessage[0];
      if (ndefRecord.payload) {
        // Skip the first 3 bytes (language code) for text records
        const payload = ndefRecord.payload.slice(3);
        return String.fromCharCode(...payload);
      }

      return undefined;
    } catch (error) {
      console.error('NDEF parsing error:', error);
      return undefined;
    }
  }

  /**
   * Check if NFC is supported on this device
   */
  async isSupported(): Promise<boolean> {
    if (this.isMockMode) {
      return true; // Mock mode always reports as supported
    }

    try {
      return await NfcManager.isSupported();
    } catch (error) {
      console.error('NFC support check error:', error);
      return false;
    }
  }

  /**
   * Check if NFC is currently enabled
   */
  async isEnabled(): Promise<boolean> {
    if (this.isMockMode) {
      return true;
    }

    try {
      return await NfcManager.isEnabled();
    } catch (error) {
      console.error('NFC enabled check error:', error);
      return false;
    }
  }

  /**
   * Write emergency profile data to NFC tag
   * @param nfcData - Data to write to the tag
   * @param options - Write options (readonly, timeout)
   */
  async writeTag(nfcData: NFCData, options: NFCWriteOptions = {}): Promise<boolean> {
    const { makeReadOnly = false, timeout = 30000 } = options;

    // Mock mode
    if (this.isMockMode) {
      console.log('Mock NFC write tag:', nfcData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return true;
    }

    try {
      if (!this.isInitialized) {
        await this.init();
      }

      // Start NFC session with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('NFC write timeout')), timeout);
      });

      const writePromise = (async () => {
        await NfcManager.requestTechnology(NfcTech.Ndef, {
          alertMessage: Platform.OS === 'ios' ? 'Hold your phone near the NFC tag' : undefined,
        });

        // Create NDEF message with multiple records
        const records = [
          // Main profile URL as URI record
          Ndef.uriRecord(nfcData.profileUrl),

          // NFC ID and metadata as text record
          Ndef.textRecord(JSON.stringify({
            nfcId: nfcData.nfcId,
            userId: nfcData.userId,
            timestamp: nfcData.timestamp,
            app: 'MedGuard',
          })),
        ];

        const bytes = Ndef.encodeMessage(records);

        // Write to tag
        await NfcManager.ndefHandler.writeNdefMessage(bytes);

        // Make readonly if requested (WARNING: This is permanent!)
        if (makeReadOnly) {
          await NfcManager.ndefHandler.makeReadOnly();
        }

        return true;
      })();

      const result = await Promise.race([writePromise, timeoutPromise]);
      return result;
    } catch (error: any) {
      console.error('NFC write tag error:', error);

      // Provide user-friendly error messages
      if (error.message?.includes('timeout')) {
        throw new Error('Write timeout - Please hold your phone steady near the tag');
      } else if (error.message?.includes('cancelled')) {
        throw new Error('Write cancelled');
      } else if (error.message?.includes('read-only')) {
        throw new Error('This tag is read-only and cannot be written to');
      } else {
        throw new Error('Failed to write to NFC tag. Please try again.');
      }
    } finally {
      await this.stopScanning();
    }
  }

  /**
   * Read emergency profile data from NFC tag
   */
  async readTag(): Promise<NFCData | null> {
    // Mock mode
    if (this.isMockMode) {
      console.log('Mock NFC read tag');
      return {
        nfcId: 'NFC-MG-2024-' + Math.floor(Math.random() * 999999).toString().padStart(6, '0'),
        userId: 'user_mock_1',
        profileUrl: 'https://medguard.app/emergency/mock-id-123',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      if (!this.isInitialized) {
        await this.init();
      }

      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: Platform.OS === 'ios' ? 'Hold your phone near the NFC tag' : undefined,
      });

      const tag = await NfcManager.getTag();

      if (!tag?.ndefMessage || tag.ndefMessage.length === 0) {
        return null;
      }

      let profileUrl = '';
      let metadata: any = null;

      // Parse all records
      for (const record of tag.ndefMessage) {
        const tnf = record.tnf; // Type Name Format
        const type = record.type;

        // URI record (profile URL)
        if (tnf === 3 || (type && String.fromCharCode(...type).includes('U'))) {
          profileUrl = this.parseUriRecord(record);
        }

        // Text record (metadata)
        else if (tnf === 1 || (type && String.fromCharCode(...type).includes('T'))) {
          const text = this.parseTextRecord(record);
          try {
            metadata = JSON.parse(text || '{}');
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      if (!profileUrl) {
        return null;
      }

      return {
        nfcId: metadata?.nfcId || tag.id || 'unknown',
        userId: metadata?.userId || 'unknown',
        profileUrl,
        timestamp: metadata?.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('NFC read tag error:', error);
      return null;
    } finally {
      await this.stopScanning();
    }
  }

  /**
   * Format/clear an NFC tag
   */
  async formatTag(): Promise<boolean> {
    // Mock mode
    if (this.isMockMode) {
      console.log('Mock NFC format tag');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return true;
    }

    try {
      if (!this.isInitialized) {
        await this.init();
      }

      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Write empty NDEF message
      const emptyMessage = Ndef.encodeMessage([]);
      await NfcManager.ndefHandler.writeNdefMessage(emptyMessage);

      return true;
    } catch (error) {
      console.error('NFC format tag error:', error);
      throw new Error('Failed to format NFC tag. Tag may be read-only.');
    } finally {
      await this.stopScanning();
    }
  }

  /**
   * Get tag information
   */
  async getTagInfo(): Promise<any> {
    if (this.isMockMode) {
      return {
        id: 'mock-tag-id',
        techTypes: ['android.nfc.tech.Ndef'],
        isWritable: true,
        maxSize: 888,
        canMakeReadOnly: true,
      };
    }

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      return tag;
    } catch (error) {
      console.error('Get tag info error:', error);
      return null;
    } finally {
      await this.stopScanning();
    }
  }

  /**
   * Open NFC settings
   */
  async openNFCSettings(): Promise<void> {
    if (this.isMockMode) {
      Alert.alert('Development Mode', 'NFC settings not available in Expo Go');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        await NfcManager.goToNfcSetting();
      } else {
        Alert.alert(
          'Enable NFC',
          'Please enable NFC in Settings > Control Center and add it to your control center.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Open NFC settings error:', error);
    }
  }

  /**
   * Parse URI record from NDEF
   */
  private parseUriRecord(record: any): string {
    try {
      if (!record.payload || record.payload.length === 0) {
        return '';
      }

      // First byte is the URI identifier code
      const identifierCode = record.payload[0];
      const payload = record.payload.slice(1);
      const uri = String.fromCharCode(...payload);

      // URI prefixes based on identifier code
      const prefixes: Record<number, string> = {
        0x00: '',
        0x01: 'http://www.',
        0x02: 'https://www.',
        0x03: 'http://',
        0x04: 'https://',
      };

      const prefix = prefixes[identifierCode] || '';
      return prefix + uri;
    } catch (error) {
      console.error('URI record parsing error:', error);
      return '';
    }
  }

  /**
   * Parse text record from NDEF
   */
  private parseTextRecord(record: any): string {
    try {
      if (!record.payload || record.payload.length === 0) {
        return '';
      }

      // First byte contains status and language code length
      const statusByte = record.payload[0];
      const languageCodeLength = statusByte & 0x3f;

      // Skip status byte and language code
      const payload = record.payload.slice(1 + languageCodeLength);
      return String.fromCharCode(...payload);
    } catch (error) {
      console.error('Text record parsing error:', error);
      return '';
    }
  }

  /**
   * Cleanup and cancel all NFC operations
   */
  async cleanup(): Promise<void> {
    // Mock mode - no-op
    if (this.isMockMode) {
      return;
    }

    try {
      await this.stopScanning();
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.error('NFC cleanup error:', error);
    }
  }
}

// Export singleton instance
export const nfcService = new NFCService();
