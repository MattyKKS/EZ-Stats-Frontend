import Image from "next/image";

export default function AuthShowcasePanel() {
  return (
    <>
      <Image
        src="/coach-training-crop.jpg"
        alt="A coach filming a youth football match on a tripod-mounted phone"
        fill
        sizes="(min-width: 1024px) 50vw, 0px"
        className="object-cover object-[25%_20%]"
        priority
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-8 pt-28 pb-16">
        <p className="text-white text-3xl font-bold leading-snug">
          Build your own team
          <br />
          create statistics —
          <br />
          with a single-camera video.
        </p>
      </div>
    </>
  );
}
