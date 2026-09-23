"use client";

import Link from "next/link";
import { useState } from "react";

const videos = [
    "/videos/chicago-barber-video-01.mp4",
    "/videos/chicago-barber-video-02.mp4",
    "/videos/chicago-barber-video-03.mp4",
    "/videos/chicago-barber-video-04.mp4",
    "/videos/chicago-barber-video-05.mp4",
    "/videos/chicago-barber-video-06.mp4",
    "/videos/chicago-barber-video-07.mp4",
    "/videos/chicago-barber-video-08.mp4",
    "/videos/chicago-barber-video-09.mp4",
    "/videos/chicago-barber-video-10.mp4",
];

export default function Contact() {
    const [videoAtual, setVideoAtual] = useState(0);

    function proximoVideo() {
        setVideoAtual((atual) => (atual + 1) % videos.length);
    }

    return (
        <main className="relative min-h-screen overflow-hidden">

            <video
                key={videos[videoAtual]}
                autoPlay
                muted
                playsInline
                onEnded={proximoVideo}
                className="absolute inset-0 h-full w-full object-cover"
            >
                <source
                    src={videos[videoAtual]}
                    type="video/mp4"
                />
            </video>

            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
                <div className="text-center text-white">

                    <h1 className="text-5xl font-bold">
                        Entre em contato
                    </h1>

                    <p className="mt-4 text-lg">
                        Acompanhe a Chicago Barber no Instagram
                    </p>

                  <Link
                      href="https://www.instagram.com/gui_gold_barber/"
                        target="_blank"
                     className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-black transition hover:bg-gray-200">
                       Instagram
                   </Link>

                </div>
            </div>

        </main>
    );
}