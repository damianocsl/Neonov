//
//  NFCReader.swift
//  Neonov
//
//  Created by Damiano on 24/11/24.
//

import Foundation
import CoreNFC

@Observable
public class NFCReader: NSObject, NFCNDEFReaderSessionDelegate {
    public var startAlert = "Hold your pen near the top of the phone."
    public var raw = "Raw Data will be available after scan."
    
    // Reference the NFC session
    private var session: NFCNDEFReaderSession?
    
    // Reference the found NFC messages
    private var nfcMessages: [[NFCNDEFMessage]] = []
    
    public func read() {
        guard NFCNDEFReaderSession.readingAvailable else {
            print("Error: NFC reading is not available")
            return
        }
        
        // Create the NFC Reader Session
        self.session = NFCNDEFReaderSession(delegate: self, queue: nil, invalidateAfterFirstRead: false)
        
        // A custom description that helps users understand how they can use NFC reader mode in the app.
        self.session?.alertMessage = self.startAlert
        
        // Begin scanning
        self.session?.begin()
    }
    
    public func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
        print("New NFC Tag detected:")
        
        for message in messages {
            for record in message.records {
                print("Type name format: \(record.typeNameFormat)")
                print("Payload: \(record.payload)")
                print("Type: \(record.type)")
                print("Identifier: \(record.identifier)")
                
                print(record)
                let payload = record.payload
                print(payload)
                let payloadString = String(data: payload, encoding:.utf8)
                print(payloadString ?? "no payloadString")
                let data = Data(payload)
                print(data)
                let dataString = String(data: data, encoding:.utf8)
                print(dataString ?? "no dataString")
                let hexString = data.map { String(format: "%02x", $0) }.joined()
                let hexString2 = data.map { String(format: "%02hhx", $0) }.joined()
                print("hexString: \(hexString)");
                print("hexString2: \(hexString2)");
                let base64String = data.base64EncodedString()
                print("base64String: \(base64String)");
                
                // read data from novopen echo plus
                let dataMessage = String(data: record.payload, encoding:.utf8)
                print("Raw message: \(dataMessage ?? "no dataMessage")")
            }
        }
        
        // Add the new messages to our found messages
        self.nfcMessages.append(messages)
            
        if messages.count > 0 {
            let payload = messages[0].records[0].payload
            print("Raw message: \(payload)")
            self.raw = String(describing: payload)
        }
        
        
        DispatchQueue.main.async {
            // Reload any view on the main-thread to display the new data-set
        }
    }
    
    public func readerSessionDidBecomeActive(_ session: NFCNDEFReaderSession) {
        print("NFC session became active")
        // Perform any initialization tasks here
    }
    
    public func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
        print("Error reading NFC: \(error.localizedDescription)")
        self.session = nil
    }
}

//extension NFCTableViewController {
//
//    override func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
//        let numberOfMessages = self.nfcMessages[section].count
//        let headerTitle = numberOfMessages == 1 ? "One Message" : "\(numberOfMessages) Messages"
//
//        return headerTitle
//    }
//
//    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
//        let cell = tableView.dequeueReusableCell(withIdentifier: "NFCTableCell", for: indexPath) as! NFCTableViewCell
//        let nfcTag = self.nfcMessages[indexPath.section][indexPath.row]
//
//        cell.textLabel?.text = "\(nfcTag.records.count) Records"
//
//        return cell
//    }
//}
