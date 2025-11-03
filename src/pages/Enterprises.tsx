import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - will be replaced with database queries
const mockEnterprises = [
  {
    id: 1,
    name: "Baguio Print Express",
    category: "Digital Printing",
    address: "Session Road, Baguio City",
    rating: 4.9,
    reviews: 428,
    deliveryTime: "Same day",
    isActive: true,
  },
  {
    id: 2,
    name: "City Printing Services",
    category: "Commercial Printing",
    address: "Harrison Road, Baguio City",
    rating: 4.8,
    reviews: 356,
    deliveryTime: "1-2 days",
    isActive: true,
  },
  {
    id: 3,
    name: "FastPrint Baguio",
    category: "Digital Printing",
    address: "Magsaysay Avenue, Baguio City",
    rating: 4.7,
    reviews: 289,
    deliveryTime: "Same day",
    isActive: true,
  },
  {
    id: 4,
    name: "Premium Print Solutions",
    category: "Commercial Printing",
    address: "Upper Session Road, Baguio City",
    rating: 4.9,
    reviews: 512,
    deliveryTime: "2-3 days",
    isActive: true,
  },
  {
    id: 5,
    name: "Quick Copy Center",
    category: "Copy & Print",
    address: "Bonifacio Street, Baguio City",
    rating: 4.6,
    reviews: 203,
    deliveryTime: "Same day",
    isActive: true,
  },
];

const categories = ["All", "Digital Printing", "Commercial Printing", "Copy & Print"];

export default function Enterprises() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredEnterprises = mockEnterprises.filter(enterprise => {
    const matchesSearch = enterprise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || enterprise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="mb-4">Printing Shops in Baguio</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Find the perfect printing shop for your needs with AI-enhanced ordering
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for printing shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnterprises.map((enterprise) => (
            <Card key={enterprise.id} className="shadow-card hover:shadow-card-hover transition-smooth overflow-hidden group">
              <div className="h-48 gradient-hero" />
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{enterprise.name}</h3>
                    <Badge variant="secondary">{enterprise.category}</Badge>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{enterprise.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{enterprise.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{enterprise.deliveryTime}</span>
                  </div>
                  <div className="text-xs">
                    {enterprise.reviews} reviews
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button variant="default" className="w-full" asChild>
                  <Link to={`/enterprises/${enterprise.id}`}>
                    View Products
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredEnterprises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No printing shops found matching your criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
