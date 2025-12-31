#!/bin/bash

# Script to create demo events for VeryEvents
# Make sure backend is running on localhost:3001

API_URL="http://localhost:3001"

echo "🎯 Creating demo events for VeryEvents..."
echo ""

# You need to be logged in first - get JWT token
echo "⚠️  Please login first and paste your JWT token:"
read -r JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

echo ""
echo "📝 Creating events..."
echo ""

# Event 1: Very Hackathon Kickoff
echo "1️⃣  Creating: Very Hackathon Kickoff"
EVENT1=$(curl -s -X POST "$API_URL/api/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Very Hackathon Kickoff",
    "description": "Join us for the official kickoff of the Very Network Hackathon! Meet fellow developers, learn about the ecosystem, and start building amazing dApps.",
    "location": "Virtual - VeryChat Group",
    "isVirtual": true,
    "date": "2026-01-15T18:00:00.000Z",
    "ticketPrice": 0.1,
    "maxTickets": 100,
    "category": "tech",
    "imageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop"
  }')

EVENT1_ID=$(echo $EVENT1 | jq -r '.id')
echo "   ✅ Created with ID: $EVENT1_ID"

# Event 2: Web3 Music Festival
echo "2️⃣  Creating: Web3 Music Festival"
EVENT2=$(curl -s -X POST "$API_URL/api/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Web3 Music Festival",
    "description": "Experience the future of music with NFT-ticketed performances from top crypto-native artists. Your ticket doubles as a collectible and grants backstage access.",
    "location": "Crypto Arena, Los Angeles",
    "isVirtual": false,
    "date": "2026-02-20T20:00:00.000Z",
    "ticketPrice": 1.5,
    "maxTickets": 50,
    "category": "music",
    "imageUrl": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop"
  }')

EVENT2_ID=$(echo $EVENT2 | jq -r '.id')
echo "   ✅ Created with ID: $EVENT2_ID"

# Event 3: NFT Art Gallery Opening
echo "3️⃣  Creating: NFT Art Gallery Opening"
EVENT3=$(curl -s -X POST "$API_URL/api/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "NFT Art Gallery Opening",
    "description": "Exclusive opening night of the first physical NFT art gallery. Meet digital artists, view rare NFTs in person, and network with collectors.",
    "location": "SoHo Art District, New York",
    "isVirtual": false,
    "date": "2026-01-25T19:00:00.000Z",
    "ticketPrice": 0.5,
    "maxTickets": 200,
    "category": "art",
    "imageUrl": "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=500&fit=crop"
  }')

EVENT3_ID=$(echo $EVENT3 | jq -r '.id')
echo "   ✅ Created with ID: $EVENT3_ID"

# Event 4: Esports Championship
echo "4️⃣  Creating: Esports Championship Finals"
EVENT4=$(curl -s -X POST "$API_URL/api/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Esports Championship Finals",
    "description": "Watch the best Web3 gamers compete for the championship title. NFT tickets include exclusive in-game items and voting rights for MVP.",
    "location": "Gaming Arena, Seoul",
    "isVirtual": false,
    "date": "2026-03-10T14:00:00.000Z",
    "ticketPrice": 2.0,
    "maxTickets": 30,
    "category": "gaming",
    "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=500&fit=crop"
  }')

EVENT4_ID=$(echo $EVENT4 | jq -r '.id')
echo "   ✅ Created with ID: $EVENT4_ID"

echo ""
echo "🎉 All events created successfully!"
echo ""
echo "📋 Event IDs:"
echo "   1. Very Hackathon Kickoff: $EVENT1_ID"
echo "   2. Web3 Music Festival: $EVENT2_ID"
echo "   3. NFT Art Gallery Opening: $EVENT3_ID"
echo "   4. Esports Championship: $EVENT4_ID"
echo ""
echo "⚡ Now activating events (deploying smart contracts)..."
echo ""

# Activate events
for EVENT_ID in "$EVENT1_ID" "$EVENT2_ID" "$EVENT3_ID" "$EVENT4_ID"; do
    if [ "$EVENT_ID" != "null" ] && [ -n "$EVENT_ID" ]; then
        echo "   Activating event: $EVENT_ID"
        RESULT=$(curl -s -X PATCH "$API_URL/api/events/$EVENT_ID/activate" \
          -H "Authorization: Bearer $JWT_TOKEN")
        
        CONTRACT=$(echo $RESULT | jq -r '.contractAddress')
        if [ "$CONTRACT" != "null" ] && [ -n "$CONTRACT" ]; then
            echo "   ✅ Deployed contract: $CONTRACT"
        else
            echo "   ⚠️  Activation pending or failed"
        fi
    fi
done

echo ""
echo "✨ Demo setup complete! Your VeryEvents platform is ready for demonstration."
echo ""
echo "🌐 View events at: http://localhost:8080/events"
echo ""
