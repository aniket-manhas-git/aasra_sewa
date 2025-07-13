#!/usr/bin/env python3
"""
Test script to verify MongoDB connection and property updates
"""

import os
import sys
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/aasrasewa")
DATABASE_NAME = "aasrasewa"
COLLECTION_NAME = "properties"

def test_mongodb_connection():
    """Test MongoDB connection"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        properties_collection = db[COLLECTION_NAME]
        
        # Test connection by counting documents
        count = properties_collection.count_documents({})
        print(f"✅ MongoDB connection successful. Found {count} properties in database.")
        
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

def test_property_update():
    """Test updating a property with a sample PDF URL"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        properties_collection = db[COLLECTION_NAME]
        
        # Find the first property in the database
        property_doc = properties_collection.find_one({})
        
        if not property_doc:
            print("❌ No properties found in database")
            print("💡 Create a property first through the application")
            return False
        
        property_id = str(property_doc["_id"])
        print(f"📋 Testing with property ID: {property_id}")
        
        # Validate ObjectId format
        if not ObjectId.is_valid(property_id):
            print(f"❌ Invalid ObjectId format: {property_id}")
            return False
        
        # Test PDF URL
        test_pdf_url = "https://res.cloudinary.com/test/raw/upload/test_report.pdf"
        
        # Update the property
        result = properties_collection.update_one(
            {"_id": ObjectId(property_id)},
            {"$set": {"healthReportPDF": test_pdf_url}}
        )
        
        if result.matched_count > 0 and result.modified_count > 0:
            print("✅ Property update test successful")
            
            # Verify the update
            updated_property = properties_collection.find_one({"_id": ObjectId(property_id)})
            if updated_property.get("healthReportPDF") == test_pdf_url:
                print("✅ PDF URL verification successful")
                
                # Clean up - remove the test URL
                properties_collection.update_one(
                    {"_id": ObjectId(property_id)},
                    {"$unset": {"healthReportPDF": ""}}
                )
                print("🧹 Test PDF URL removed from database")
                
                return True
            else:
                print("❌ PDF URL verification failed")
                return False
        else:
            print("❌ Property update test failed")
            print(f"   Matched count: {result.matched_count}")
            print(f"   Modified count: {result.modified_count}")
            return False
            
    except Exception as e:
        print(f"❌ Property update test failed: {e}")
        return False

def test_property_id_validation():
    """Test ObjectId validation"""
    print("\n🔍 Testing ObjectId validation...")
    
    # Test valid ObjectId
    valid_id = "507f1f77bcf86cd799439011"
    if ObjectId.is_valid(valid_id):
        print("✅ Valid ObjectId format accepted")
    else:
        print("❌ Valid ObjectId format rejected")
        return False
    
    # Test invalid ObjectId
    invalid_id = "invalid_id"
    if not ObjectId.is_valid(invalid_id):
        print("✅ Invalid ObjectId format correctly rejected")
    else:
        print("❌ Invalid ObjectId format incorrectly accepted")
        return False
    
    return True

def main():
    print("🧪 Testing MongoDB Connection and Property Updates")
    print("=" * 50)
    
    # Test ObjectId validation
    if not test_property_id_validation():
        print("❌ ObjectId validation test failed.")
        sys.exit(1)
    
    # Test connection
    if not test_mongodb_connection():
        print("❌ Connection test failed. Please check your MongoDB configuration.")
        print("\n💡 Troubleshooting tips:")
        print("   1. Make sure MongoDB is running")
        print("   2. Check your MONGO_URI in .env file")
        print("   3. Verify database name and collection name")
        sys.exit(1)
    
    # Test property update
    if not test_property_update():
        print("❌ Property update test failed. Please check your database permissions.")
        print("\n💡 Troubleshooting tips:")
        print("   1. Create a property first through the application")
        print("   2. Check MongoDB user permissions")
        print("   3. Verify the properties collection exists")
        sys.exit(1)
    
    print("\n✅ All tests passed!")
    print("🎉 Your MongoDB connection and property updates are working correctly!")

if __name__ == "__main__":
    main() 