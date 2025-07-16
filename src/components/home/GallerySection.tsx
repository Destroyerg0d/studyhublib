
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const GallerySection = () => {
  const galleryImages = [
    {
      src: "/lovable-uploads/ef2d0636-cde8-4bc6-b5b8-def941616221.png",
      alt: "Study area with wooden desks and motivational signage",
      title: "Premium Study Environment"
    },
    {
      src: "/lovable-uploads/8f35572b-d229-467a-a404-15765ce9f7e6.png",
      alt: "Modern library interior with stairs and ceiling fans",
      title: "Modern Infrastructure"
    },
    {
      src: "/lovable-uploads/4943fd41-9a62-4110-8b5f-2eb449c0237e.png",
      alt: "Spacious study hall with wooden partitions",
      title: "Spacious Study Halls"
    },
    {
      src: "/lovable-uploads/6073a091-80f3-4399-bffe-8668a976adc1.png",
      alt: "Individual study booths with power outlets",
      title: "Individual Study Booths"
    },
    {
      src: "/lovable-uploads/ae040354-0626-4deb-a7e5-bb671c4035bd.png",
      alt: "Students studying in a well-lit environment",
      title: "Focused Study Environment"
    },
    {
      src: "/lovable-uploads/f004eb89-a3cf-473a-9680-4d24fa0f3b91.png",
      alt: "Multi-level study area with modern amenities",
      title: "Multi-Level Study Areas"
    },
    {
      src: "/lovable-uploads/790e5486-9319-4cc0-980b-ce003f3659fc.png",
      alt: "Large study hall with students working",
      title: "Collaborative Study Spaces"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Facilities</h2>
          <p className="text-xl text-gray-600">Take a virtual tour of our premium study environment</p>
        </div>
        
        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent>
            {galleryImages.map((image, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <h3 className="text-white font-semibold p-6 text-lg">{image.title}</h3>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>
    </section>
  );
};

export default GallerySection;
