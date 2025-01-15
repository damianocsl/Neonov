//
//  ContentView.swift
//  Neonov
//
//  Created by Damiano on 31/10/24.
//

import SwiftUI
import CoreNFC

struct ContentView: View {
    @State private var penReader = NFCPenReader()
    @State public var showingAlert = false
    
    func startNFCSession() {
        penReader.startSession()
    }
    
    var body: some View {
        VStack {
            HStack {
                Spacer()
                Button(action: startNFCSession) {
                    Image(systemName: "wave.3.right")
                }
            }
            TabView {
                Text("NFC data: \(penReader.raw)")
                    .tabItem {
                        Image(systemName: "syringe")
                        Text("Log")
                    }
                Text("Settings")
                    .tabItem {
                        Image(systemName: "gearshape")
                        Text("Settings")
                    }
            }
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
