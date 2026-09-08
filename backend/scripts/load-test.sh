#!/bin/bash
echo "Running load test on /profile/all (Catalog) with 100 concurrent users for 10 seconds..."
npx autocannon -c 100 -d 10 http://localhost:3000/profile/all > load_test_profiles_raw.txt

echo "Running load test on /profile/user/user_1 (Detail) with 100 concurrent users for 10 seconds..."
npx autocannon -c 100 -d 10 http://localhost:3000/profile/user/user_1 > load_test_detail_raw.txt

echo "Running load test on /health (Healthcheck) with 100 concurrent users for 10 seconds..."
npx autocannon -c 100 -d 10 http://localhost:3000/health > load_test_health_raw.txt

echo "Load tests finished. Raw output saved in load_test_*_raw.txt"
