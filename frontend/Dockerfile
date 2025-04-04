FROM node:18

WORKDIR /app

# Αντέγραψε τα βασικά αρχεία για να γίνει install
COPY package.json ./

# Εγκατάσταση dependencies
RUN npm install

# Αντέγραψε όλα τα αρχεία
COPY . .

# Κάνε build του React app
RUN npm run build

# Εγκατέστησε serve για να σερβίρει το frontend
RUN npm install -g serve

# Τρέξε το static site
CMD ["serve", "-s", "dist", "-l", "3000"]

