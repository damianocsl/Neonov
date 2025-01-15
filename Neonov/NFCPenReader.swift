//
//  NFCReaderISO7816.swift
//  Neonov
//
//  Created by Damiano on 14/01/25.
//

import Foundation
import CoreNFC

extension Data {
    func hexEncodedString() -> String {
        return map { String(format: "%02hhx", $0) }.joined()
    }
}

@Observable
public class NFCPenReader: NSObject, NFCTagReaderSessionDelegate {
    public var startAlert = "Hold your pen near the top of the phone."
    public var raw = "Raw Data will be available after scan."
    
    public var session: NFCTagReaderSession?
    
    public func startSession() {
        session = NFCTagReaderSession(pollingOption: .iso14443, delegate: self, queue: .main)
        session?.begin()
    }
    
    public func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {
            print("NFC session became active")
    }
    
    public func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        print("New NFC Tag detected:")
        for tag in tags {
            print(tag)
            
            // Interrogate tag
            session.connect(to: tag) { (error: Error?) in
                if error != nil {
                    print("Error connecting to tag: \(error!.localizedDescription)")
                    return
                }
                
                if case let .iso7816(iso7816Tag) = tag {
                    print("ISO7816 Tag detected")
//                    let apdu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xB0, p1Parameter: 0x00, p2Parameter: 0x00, data: Data(), expectedResponseLength: 65536)
//                    iso7816Tag.sendCommand(apdu: apdu) { (data, sw1, sw2, error) in
//                        if error != nil {
//                            print("Error sending command to tag: \(error!.localizedDescription)")
//                            return
//                        }
//                        print(data)
//                        print(sw1)
//                        print(sw2)
//                        print(sw1.description)
//                        print(sw2.description)
//                        print("Response from tag: \(data.hexEncodedString())")
//                        self.raw = data.hexEncodedString()
//                    }

                    // java version
                    // private static final int CLA = 0x00;
                    // private static final int INS_SL = 0xA4;
                    // private static final int BY_NAME = 0x04;
                    // private static final int FIRST_ONLY = 0x0C;
                    let apdu2 = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x04, p2Parameter: 0x0C, data: Data(), expectedResponseLength: 255)
                    iso7816Tag.sendCommand(apdu: apdu2) { (data, sw1, sw2, error) in
                        if error != nil {
                            print("Error sending command to tag: \(error!.localizedDescription)")
                            return
                        }
                        print(data)
                        print(sw1)
                        print(sw2)
                        print(sw1.description)
                        print(sw2.description)
                        print("Response from tag: \(data.hexEncodedString())")
                        self.raw = data.hexEncodedString()
                    }
                }
            }
        }
    }
    
    public func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: any Error) {
        print("Error reading NFC: \(error.localizedDescription)")
        self.session = nil
    }
}
