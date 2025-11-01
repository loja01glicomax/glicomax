
"use client"

// Importações necessárias do React e componentes
import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Minus,
  Plus,
  Search,
  User,
  ShoppingCart,
  Menu,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Zap,
  Smartphone,
  ThumbsUp,
  HelpCircle,
  RotateCcw,
  CheckCircle,
  Droplet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function ProductPage() {
  // ========================================
  // ESTADOS DO COMPONENTE
  // ========================================

  // Estado para controlar qual imagem está sendo exibida no carrossel principal
  const [currentImage, setCurrentImage] = useState(0)

  // Estado para controlar qual kit está selecionado (1, 2 ou 3 unidades)
  const [selectedKit, setSelectedKit] = useState(1)

  // Estado para controlar a quantidade de produtos que o usuário quer comprar
  const [quantity, setQuantity] = useState(1)

  // Estado para controlar quantas avaliações estão sendo exibidas (carrega mais ao clicar)
  const [reviewsToShow, setReviewsToShow] = useState(10)

  // Estado para filtrar avaliações por número de estrelas
  const [filterRating, setFilterRating] = useState("Todos")

  // Estado para ordenar avaliações (mais recentes, antigas, úteis)
  const [sortBy, setSortBy] = useState("Últimas")

  // Estado para controlar se o menu mobile está aberto ou fechado
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Estado para controlar quais seções do footer estão abertas (accordion)
  const [footerSectionOpen, setFooterSectionOpen] = useState({
    atendimento: true,
    politicas: false,
  })

  // Estado para armazenar o CEP digitado pelo usuário
  const [cep, setCep] = useState("")

  // Estado para armazenar o endereço retornado pela API ViaCEP
  const [address, setAddress] = useState<{
    logradouro: string
    bairro: string
    localidade: string
    uf: string
  } | null>(null)

  // Estado para mostrar loading enquanto busca o CEP
  const [loadingCep, setLoadingCep] = useState(false)

  // Estado para mostrar mensagens de erro ao buscar CEP
  const [cepError, setCepError] = useState("")

  // Estado para controlar se o botão de compra fixo deve aparecer
  const [showStickyButton, setShowStickyButton] = useState(false)

  // Referência para o botão de compra original (usado para detectar quando sai da tela)
  const buyButtonRef = useRef<HTMLButtonElement>(null)

  // ========================================
  // CONFIGURAÇÃO DE IMAGENS POR KIT
  // ========================================

  // Objeto que mapeia cada kit (1, 2 ou 3 unidades) para suas respectivas imagens
  // Cada kit tem uma imagem principal + imagens de marketing compartilhadas
  const kitImages = {
    1: [
      "/kit-1-single-device.png",
      "/marketing-multiple-views.png",
      "/marketing-usage-finger.png",
      "/marketing-lifestyle.png",
      "/marketing-person-holding.png",
    ],
    2: [
      "/kit-2-two-devices.png",
      "/marketing-multiple-views.png",
      "/marketing-usage-finger.png",
      "/marketing-lifestyle.png",
      "/marketing-person-holding.png",
    ],
    3: [
      "/kit-3-three-devices.png",
      "/marketing-multiple-views.png",
      "/marketing-usage-finger.png",
      "/marketing-lifestyle.png",
      "/marketing-person-holding.png",
    ],
  }

  // Pega as imagens do kit atualmente selecionado
  const currentKitImages = kitImages[selectedKit as keyof typeof kitImages] || kitImages[1]

  // ========================================
  // CONFIGURAÇÃO DE PREÇOS E DESCONTOS
  // ========================================

  // Array com as opções de kits disponíveis e seus respectivos preços
  const kitOptions = [
    {
      units: 1,
      image: "/kit-1-single-device.png",
      price: 127,
      originalPrice: 260,
      discount: 51,
      discountAmount: 133,
      installment: 12.87,
    },
    {
      units: 2,
      image: "/kit-2-two-devices.png",
      price: 239.9,
      originalPrice: 520,
      discount: 54,
      discountAmount: 280.1,
      installment: 23.99,
    },
    {
      units: 3,
      image: "/kit-3-three-devices.png",
      price: 329.9,
      originalPrice: 780,
      discount: 58,
      discountAmount: 450.1,
      installment: 32.99,
    },
  ]

  // Encontra o kit atualmente selecionado no array de opções
  const currentKit = kitOptions.find((kit) => kit.units === selectedKit) || kitOptions[0]

  // ========================================
  // EFEITO PARA BOTÃO DE COMPRA FIXO
  // ========================================

  // useEffect que monitora o scroll da página para mostrar/esconder o botão fixo
  useEffect(() => {
    const handleScroll = () => {
      if (buyButtonRef.current) {
        const buttonRect = buyButtonRef.current.getBoundingClientRect()
        // Mostra o botão fixo quando o botão original sai da tela (scroll para baixo)
        setShowStickyButton(buttonRect.bottom < 0)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // ========================================
  // FUNÇÃO PARA BUSCAR ENDEREÇO POR CEP
  // ========================================

  // Função que faz a chamada para a API ViaCEP e retorna o endereço
  const fetchAddressFromCep = async (cepValue: string) => {
    // Remove caracteres não numéricos do CEP
    const cleanCep = cepValue.replace(/\D/g, "")

    // Valida se o CEP tem 8 dígitos
    if (cleanCep.length !== 8) {
      setCepError("CEP deve conter 8 dígitos")
      return
    }

    setLoadingCep(true)
    setCepError("")

    try {
      // Faz a requisição para a API ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      // Verifica se o CEP foi encontrado
      if (data.erro) {
        setCepError("CEP não encontrado")
        setAddress(null)
      } else {
        setAddress(data)
        setCepError("")
      }
    } catch (error) {
      setCepError("Erro ao buscar CEP. Tente novamente.")
      setAddress(null)
    } finally {
      setLoadingCep(false)
    }
  }

  // ========================================
  // FUNÇÃO PARA FORMATAR CEP
  // ========================================

  // Formata o CEP no padrão 00000-000
  const formatCep = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    if (cleanValue.length <= 5) {
      return cleanValue
    }
    return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`
  }

  // ========================================
  // HANDLER PARA MUDANÇA NO INPUT DE CEP
  // ========================================

  // Função chamada quando o usuário digita no campo de CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value)
    setCep(formatted)

    // Busca automaticamente o endereço quando o CEP estiver completo (8 dígitos)
    const cleanCep = formatted.replace(/\D/g, "")
    if (cleanCep.length === 8) {
      fetchAddressFromCep(formatted)
    } else {
      setAddress(null)
      setCepError("")
    }
  }

  // ========================================
// FUNÇÕES DE NAVEGAÇÃO DO CARROSSEL
// ========================================

// Avança para a próxima imagem do carrossel
const nextImage = () => {
  setCurrentImage((prev) => (prev + 1) % currentKitImages.length)
}

// Volta para a imagem anterior do carrossel
const prevImage = () => {
  setCurrentImage((prev) => (prev - 1 + currentKitImages.length) % currentKitImages.length)
}

// ================================================================
// ======================= INÍCIO DA ALTERAÇÃO ======================
// ================================================================

// LÓGICA PARA O SWIPE (ARRASTAR COM O DEDO) NO MOBILE
const touchStartX = useRef<number | null>(null)
const touchEndX = useRef<number | null>(null)
const minSwipeDistance = 50 // Distância mínima para considerar um swipe

const handleTouchStart = (e: React.TouchEvent) => {
  // Guarda a posição inicial do toque
  touchEndX.current = null // Reseta o ponto final
  touchStartX.current = e.touches[0].clientX
}

const handleTouchMove = (e: React.TouchEvent) => {
  // Atualiza a posição final enquanto o dedo se move
  touchEndX.current = e.touches[0].clientX
}

const handleTouchEnd = () => {
  // Verifica se o movimento foi significativo o suficiente
  if (!touchStartX.current || !touchEndX.current) return
  const distance = touchStartX.current - touchEndX.current

  // Se arrastou para a esquerda, avança a imagem
  if (distance > minSwipeDistance) {
    nextImage()
  }
  // Se arrastou para a direita, volta a imagem
  else if (distance < -minSwipeDistance) {
    prevImage()
  }

  // Limpa as posições para o próximo swipe
  touchStartX.current = null
  touchEndX.current = null
}

// ================================================================
// ======================== FIM DA ALTERAÇÃO ========================
// ================================================================

  // ========================================
  // FUNÇÃO PARA TROCAR DE KIT
  // ========================================

  // Função chamada quando o usuário seleciona um kit diferente
  const handleKitChange = (kitUnits: number) => {
    setSelectedKit(kitUnits)
    setCurrentImage(0) // Reseta para a primeira imagem do novo kit
  }

  // ========================================
  // FUNÇÃO PARA REDIRECIONAR PARA CHECKOUT
  // ========================================

  // Função que redireciona para a página de checkout com informações do produto
  const handleBuyNow = () => {
    // Monta os parâmetros da URL com as informações do produto
    const params = new URLSearchParams({
      produto: "GlicoMax Original - Medidor de Açúcar a Laser", // Nome do produto
      kit: selectedKit.toString(), // Quantidade de unidades no kit (1, 2 ou 3)
      preco: currentKit.price.toString(), // Preço do kit selecionado
      quantidade: quantity.toString(), // Quantidade de kits que o usuário quer comprar
      desconto: currentKit.discount.toString(), // Percentual de desconto
      valorOriginal: currentKit.originalPrice.toString(), // Preço original sem desconto
    })

    // Redireciona para a página de checkout com os parâmetros
    window.location.href = `https://checkout-five-ruby.vercel.app/?${params.toString()}`
  }

  // ========================================
  // DADOS DAS AVALIAÇÕES
  // ========================================

  // Array com todas as avaliações dos clientes
  const reviews = [
    {
      id: 1,
      name: "Ricardo Nogueir...",
      rating: 5,
      comment: "Os resultados são rapidíssimos, em segundos, como prometido. Ótima aquisição",
      avatar: "https://scontent.fumu2-2.fna.fbcdn.net/v/t39.30808-1/273048812_4576202005821544_3033817137221055929_n.jpg?stp=cp0_dst-jpg_p64x64_tt6&_nc_cat=110&ccb=1-7&_nc_sid=e99d92&_nc_ohc=6S7jvzUmWCYQ7kNvwE3q2_P&_nc_oc=Adm6-tov4gVHZcU8-x47cxxdOHud1SU8UcckxlsY4DkHqepGg6ITWLnrbLgc4rLJnm0&_nc_zt=24&_nc_ht=scontent.fumu2-2.fna&_nc_gid=l-dW1IzSO9BGn3LxvUwGwA&oh=00_AfezE3GsN9lCki8587qWt0fI_tqZ_Dox8xUXOtnBVrLgpw&oe=68F8E683",
      date: "15 de outubro de 2025",
    },
    {
      id: 2,
      name: "Eduardo Barbosa",
      rating: 5,
      comment: "Produto eficiente, entrega rápida e rastreamento disponível, tudo conforme prometido",
      avatar: "https://scontent.fumu2-2.fna.fbcdn.net/v/t39.30808-1/517840635_10162845801494561_8973679599971107189_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=105&ccb=1-7&_nc_sid=1d2534&_nc_ohc=4t7_Wc_jQ9MQ7kNvwGM3GNs&_nc_oc=AdkWsDuPK6Aqe2_2KGd39ZOTraiz5e6mg71ZFWDIvlBcsp1Td0lH_TthD8MHTTO435Q&_nc_zt=24&_nc_ht=scontent.fumu2-2.fna&_nc_gid=BlNThfREUFT811Ms0Ar3yw&oh=00_AfecTUSF0O0bKXdNu62yHxMw5G3bw7fOP5ffpQDQAjuaZA&oe=68F8D049",
      date: "12 de outubro de 2025",
    },
    {
      id: 3,
      name: "Larissa Fernand...",
      rating: 5,
      comment: "Design moderno e acabamento em ABS resistente, parece robusto e durável",
      avatar: "https://scontent.fumu2-1.fna.fbcdn.net/v/t39.30808-1/419439292_6871436022984189_5818959155912265955_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=103&ccb=1-7&_nc_sid=1d2534&_nc_ohc=OzjdWu3unZUQ7kNvwHK1nz4&_nc_oc=AdnJFRAFNeuSOAa5YPFaK5A6ZzuAMS2Wtgfh7SPWUDmKDRiMxW8TKdVDW_R1gp49M6I&_nc_zt=24&_nc_ht=scontent.fumu2-1.fna&_nc_gid=GyI8FdnnRBQToj6yPWrCbQ&oh=00_AfeR3jbp37GvUk2gNHRio8Az86P1Bgi4Ag6bihe-_DWJUw&oe=68F8D691",
      date: "10 de outubro de 2025",
    },
    {
      id: 4,
      name: "Lucas Pereira",
      rating: 5,
      comment:
        "Sem agulhas, fácil de usar, e ainda acompanha a frequência cardíaca. Recomendo para quem busca praticidade",
      avatar: "https://scontent.fumu2-2.fna.fbcdn.net/v/t39.30808-1/557635674_24744152401942096_6775971178613554475_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=110&ccb=1-7&_nc_sid=1d2534&_nc_ohc=yZ5mPD_OgN4Q7kNvwGyqhhS&_nc_oc=Adll3NSyFh8taJ2YS9wYABRyFXEZmztwZEq3TwU_JvJ8yqYzSyQYUM5ZB6COFOXftuQ&_nc_zt=24&_nc_ht=scontent.fumu2-2.fna&_nc_gid=9YEpnafMiFLAGrN_JP-srQ&oh=00_AfcibKxvFGTUG6ufbK2KP_r1h13jmipk3up0L6oWg2wCDw&oe=68F8D1C3",
      date: "8 de outubro de 2025",
    },
    {
      id: 5,
      name: "Bruna Santos",
      rating: 5,
      comment: "Sensores avançados que realmente funcionam e a precisão de 99,9% é uma das melhores que já vi",
      avatar: "https://scontent.fumu2-2.fna.fbcdn.net/v/t39.30808-1/536106806_1505969033901337_5654637192239597691_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=111&ccb=1-7&_nc_sid=1d2534&_nc_ohc=nBPChW00ckIQ7kNvwHC-XsF&_nc_oc=AdmGFdm44uucma-qQ8sfDVM0KMFMqVxoOYo6WsJ4v36wPVZZbFAEqIyBEhkUutO4L6I&_nc_zt=24&_nc_ht=scontent.fumu2-2.fna&_nc_gid=9YEpnafMiFLAGrN_JP-srQ&oh=00_AffGuatAryED7saj3KrgNr3tw2jndzdOqOrbFMJyCyW69Q&oe=68F8DACE",
      date: "5 de outubro de 2025",
    },
    {
      id: 6,
      name: "Juliana Ribeiro",
      rating: 5,
      comment:
        "Design portátil e tela digital de alta definição. Ideal para levar na bolsa e monitorar a glicemia em qualquer lugar",
      avatar: "https://scontent.fumu2-2.fna.fbcdn.net/v/t39.30808-1/477039856_122096246738771807_2194081625051012783_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=W5frrgl8asgQ7kNvwH95qtj&_nc_oc=AdkY7CJYLkLwwuxwqbTWjvvBoNBvBnPy_9g_67igv6vFeaAVMRArnh0jQ3yGRxAyLH0&_nc_zt=24&_nc_ht=scontent.fumu2-2.fna&_nc_gid=GyI8FdnnRBQToj6yPWrCbQ&oh=00_AffZMM9-aEolcm17e139Gid9en9EAr9Cu-kbOl1VFmk4BA&oe=68F8D428",
      date: "3 de outubro de 2025",
    },
    {
      id: 7,
      name: "Mariana Oliveir...",
      rating: 5,
      comment:
        "Adorei o aplicativo sincronizado, consigo acompanhar meu histórico de leituras de forma muito mais organizada",
      avatar: "https://scontent.fumu2-2.fna.fbcdn.net/v/t39.30808-1/518054935_122131887236820281_3280278060392206017_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=aehPzN31OScQ7kNvwHm7RsX&_nc_oc=AdniSLV9SosFNdVfhGPHkkU9bTdB5YmVSzN7ji-a6ZL1s8PD34Rkikyf4NNl-79nm7s&_nc_zt=24&_nc_ht=scontent.fumu2-2.fna&_nc_gid=MVjxjJizm8WQXG2elZ40Ig&oh=00_AfeGczeQyjlW2kprVwZNsk1D9P9ecct9hlV_1znzKD8SkA&oe=68F8F268",
      date: "1 de outubro de 2025",
    },
    {
      id: 8,
      name: "Fernando Lima",
      rating: 5,
      comment: "Alta precisão e rapidez. Uso diariamente e os resultados têm sido confiáveis e consistentes",
      avatar: "https://scontent.fumu2-1.fna.fbcdn.net/v/t1.6435-1/117774091_2883794845064963_3092215292331925417_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=107&ccb=1-7&_nc_sid=e99d92&_nc_ohc=sb0RgWc1GOQQ7kNvwHuluwn&_nc_oc=AdleupESJ1R1mLZqn91Hx6GMp-EI5E6vN08JNDM4pVLx8N62Vki3joCiAFfIpuRH1Rg&_nc_zt=24&_nc_ht=scontent.fumu2-1.fna&_nc_gid=9YEpnafMiFLAGrN_JP-srQ&oh=00_AfdwRtAPy-7nrZoy6tbzrglYomNGoOlZxMECcLJYntZHRg&oe=691A7D77",
      date: "28 de setembro de 2025",
    },
    {
      id: 9,
      name: "Carlos Eduardo ...",
      rating: 5,
      comment:
        "Excelente dispositivo, mede glicose, oxigênio e frequência cardíaca em um único aparelho. Super prático",
      avatar: "https://scontent.fumu2-1.fna.fbcdn.net/v/t1.6435-1/136967677_3534742896632837_8961012453532262140_n.jpg?stp=cp0_dst-jpg_p64x64_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=HMxuZ3lkSg0Q7kNvwGrZYjb&_nc_oc=AdlfBz0eoayxo62CXLVUFSvdBS4mq_mzqEwnCg6aZAnEaUNuymVAhQs1Jx-dIA_Wcj0&_nc_zt=24&_nc_ht=scontent.fumu2-1.fna&_nc_gid=V9-jDA4g2NRv7zL2EUV5GA&oh=00_AfdjWdeHgfKEQeDdgzDNgAAVdYf6fzKN93J1K5oHXty1TQ&oe=691A9534",
      date: "25 de setembro de 2025",
    },
    {
      id: 10,
      name: "Ana Beatriz Sil...",
      rating: 5,
      comment:
        "Fiquei impressionada com a tecnologia sem agulhas, realmente elimina o desconforto das picadas e oferece resultados quais [...]",
      avatar: "https://scontent.fumu2-2.fna.fbcdn.net/v/t1.6435-1/69550924_490856575047496_4987942131562708992_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=111&ccb=1-7&_nc_sid=e99d92&_nc_ohc=9-5-Db2rTdYQ7kNvwGE8aPO&_nc_oc=AdlS46UCIfDxDBF8K8D9UpMtvbA4qCDumENSvQLP9UIJ52cpDp1Mg-we-sATJPBTwMY&_nc_zt=24&_nc_ht=scontent.fumu2-2.fna&_nc_gid=CvsKps9qTZqaYSIDihJQDg&oh=00_AfdfvUcPgdUkKmU1dlu1vQvMVbNkfUc1yrsq6FxWzt8VsA&oe=691A75CD",
      date: "22 de setembro de 2025",
    },
    {
      id: 11,
      name: "Pedro Henrique",
      rating: 5,
      comment: "Produto de excelente qualidade, chegou rápido e bem embalado. Recomendo!",
      avatar: "https://scontent.fumu2-1.fna.fbcdn.net/v/t39.30808-1/474630347_28685370687775252_8784022013925762273_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=100&ccb=1-7&_nc_sid=e99d92&_nc_ohc=3uF_Hf7SqJ8Q7kNvwHqnV7d&_nc_oc=AdmRY1Wz2X1X8PseMjnMvb18pyAa7tZhFxxxkisawG7ztVZ1FCGAC2Jiheaa7i_3oEM&_nc_zt=24&_nc_ht=scontent.fumu2-1.fna&_nc_gid=V9-jDA4g2NRv7zL2EUV5GA&oh=00_AfcH0DRZQlfTz1GPBa7HeIQkD9d6-qxvWzLFZ_AfgFUaWw&oe=68F8D7FF",
      date: "20 de setembro de 2025",
    },
    {
      id: 12,
      name: "Camila Souza",
      rating: 5,
      comment: "Muito satisfaíta com a compra. O aparelho é preciso e fácil de usar.",
      avatar: "https://scontent.fumu2-2.fna.fbcdn.net/v/t39.30808-1/485087206_1460710174896267_1150724442080579099_n.jpg?stp=cp0_dst-jpg_s64x64_tt6&_nc_cat=101&ccb=1-7&_nc_sid=e99d92&_nc_ohc=sgJEeNor1b4Q7kNvwF620S8&_nc_oc=AdkQK_Y_71uuYrx_lvQqe2F3VvZH_mPcCSSLeFaqte85kKWOVUZ5elxuyw7tuXgnyUI&_nc_zt=24&_nc_ht=scontent.fumu2-2.fna&_nc_gid=pyL5AZvU2D2pd4pXF3lTJA&oh=00_AfcEfLNstModCdhk2FyTcXMHSU_5NIJBEOLzfTOjr-OYvg&oe=68F8F31B",
      date: "18 de setembro de 2025",
    },
  ]

  // Número total de avaliações (usado para mostrar "1427+ avaliações")
  const totalReviews = 1427

  // Média de avaliação do produto
  const averageRating = 4.8

  // ========================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========================================
          HEADER / CABEÇALHO
          ======================================== */}
      <header className="bg-[#5DAFBD] text-white sticky top-0 z-50">
        {/* Banner superior com frete grátis */}
        <div className="bg-[#4A9DAB] py-2 text-center text-xs sm:text-sm px-4">
          <span className="inline-flex items-center gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            <span className="truncate">FRETE GRÁTIS PARA TODO BRASIL</span>
          </span>
        </div>

        {/* Header principal com logo e navegação */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Logo da loja */}
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
              <div className="text-base sm:text-xl font-bold">
                <div>VAREJO</div>
                <div className="text-xs sm:text-sm font-normal">SHOP</div>
              </div>
            </div>

            {/* Menu de navegação - visível apenas em desktop */}
            <nav className="hidden lg:flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white/80 transition-colors whitespace-nowrap">
                Produtos da Loja
              </a>
              <a href="#" className="hover:text-white/80 transition-colors whitespace-nowrap">
                Rastrear Pedidos
              </a>
              <a href="#" className="hover:text-white/80 transition-colors whitespace-nowrap">
                Sobre Nós
              </a>
              <a href="#" className="hover:text-white/80 transition-colors whitespace-nowrap">
                Contatos
              </a>
            </nav>

            {/* Ícones de ação (busca, usuário, carrinho, menu mobile) */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button className="hidden sm:block hover:text-white/80 transition-all duration-200 hover:scale-110">
                <Search className="w-5 h-5" />
              </button>
              <button className="hidden sm:block hover:text-white/80 transition-all duration-200 hover:scale-110">
                <User className="w-5 h-5" />
              </button>
              <button className="hover:text-white/80 transition-all duration-200 hover:scale-110">
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button
                className="lg:hidden hover:text-white/80 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Menu mobile - aparece quando o botão de menu é clicado */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/20 py-4 space-y-3">
              <a href="#" className="block py-2 hover:text-white/80 transition-colors">
                Produtos da Loja
              </a>
              <a href="#" className="block py-2 hover:text-white/80 transition-colors">
                Rastrear Pedidos
              </a>
              <a href="#" className="block py-2 hover:text-white/80 transition-colors">
                Sobre Nós
              </a>
              <a href="#" className="block py-2 hover:text-white/80 transition-colors">
                Contatos
              </a>
              <div className="flex gap-4 pt-2">
                <button className="hover:text-white/80 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button className="hover:text-white/80 transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========================================
          CONTEÚDO PRINCIPAL
          ======================================== */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* ========================================
            SEÇÃO DO PRODUTO
            ======================================== */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col lg:grid lg:grid-cols-[auto_1fr_1fr] gap-4 sm:gap-6 lg:gap-8">
         {/* Imagem principal do produto com carrossel */}
<div className="relative order-1 lg:order-2">
  <div 
    className="relative aspect-square bg-white rounded-lg group"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
    <Image
      src={currentKitImages[currentImage] || "/placeholder.svg"}
      alt="GlicoMax Device"
      fill
      className="object-contain p-4 sm:p-8"
      style={{ touchAction: 'pan-y', userSelect: 'none' }}
    />

    {/* ================================================================ */}
    {/* ======================= INÍCIO DA ALTERAÇÃO ====================== */}
    {/* ================================================================ */}
    
    {/* Botão para imagem anterior */}
    <button
      onClick={prevImage}
      // ALTERAÇÃO AQUI: Classes de visibilidade responsiva
      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10 lg:opacity-0 lg:group-hover:opacity-100"
      aria-label="Previous image"
    >
      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
    </button>

    {/* Botão para próxima imagem */}
    <button
      onClick={nextImage}
      // ALTERAÇÃO AQUI: Classes de visibilidade responsiva
      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10 lg:opacity-0 lg:group-hover:opacity-100"
      aria-label="Next image"
    >
      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
    </button>

    {/* ================================================================ */}
    {/* ======================== FIM DA ALTERAÇÃO ======================== */}
    {/* ================================================================ */}

    {/* Indicadores de posição do carrossel (bolinhas) */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      {currentKitImages.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentImage(index)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            currentImage === index ? "bg-[#5DAFBD] w-6" : "bg-gray-300 hover:bg-gray-400"
          }`}
          aria-label={`Go to image ${index + 1}`}
        />
      ))}
    </div>
  </div>
  {/* O resto do seu código, como o texto "Passe o mouse...", continua aqui */}
              {/* Texto de instrução para zoom (apenas desktop) */}
              <p className="hidden sm:flex text-center text-sm text-gray-500 mt-4 items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
                Passe o mouse sobre a foto para ampliar
              </p>
            </div>

            {/* Galeria de miniaturas (thumbnails) */}
            <div className="flex lg:flex-col gap-2 sm:gap-3 order-2 lg:order-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {currentKitImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all duration-300 hover:scale-105 flex-shrink-0 ${
                    currentImage === index ? "border-purple-500 shadow-md" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-contain p-1 sm:p-2"
                  />
                </button>
              ))}
            </div>

            {/* Detalhes do produto (preço, quantidade, etc) */}
            <div className="space-y-4 sm:space-y-5 order-3">
              {/* Cabeçalho com título e informações */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Image
                    src="/verified-badge.png"
                    alt="Verificado"
                    width={20}
                    height={20}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-xs sm:text-sm font-medium text-[#000000]">Site Oficial de Vendas</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <span className="text-gray-500">Novo</span>
                  <span>|</span>
                  <span>18204 Vendidos</span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700 leading-tight">
                  GlicoMax Original - Medidor de Açúcar a Laser
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  (Cód. Item 33399154) |{" "}
                  <a href="#" className="text-blue-500 hover:underline transition-colors">
                    Disponível em estoque.
                  </a>
                </p>
              </div>

              {/* Seleção de kit (1, 2 ou 3 unidades) */}
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  QUANTIDADE: KIT {selectedKit} UNIDADE{selectedKit > 1 ? "S" : ""}
                </p>
                <div className="flex gap-2 sm:gap-3">
                  {kitOptions.map((kit) => (
                    <button
                      key={kit.units}
                      onClick={() => handleKitChange(kit.units)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${
                        selectedKit === kit.units
                          ? "border-purple-500 shadow-lg scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={kit.image || "/placeholder.svg"}
                        alt={`Kit ${kit.units}`}
                        fill
                        className="object-contain p-1 sm:p-2"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Seção de preços e descontos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-gray-500">Preço:</span>
                  <span className="text-sm sm:text-base text-gray-400 line-through transition-all duration-300">
                    R$ {currentKit.originalPrice.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-500 transition-all duration-300">
                    R$ {currentKit.price.toFixed(2).replace(".", ",")}
                  </span>
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold transition-all duration-300">{currentKit.discount}%</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 transition-all duration-300">
                  Em até 12x de{" "}
                  <span className="font-semibold">R$ {currentKit.installment.toFixed(2).replace(".", ",")}</span>
                </p>
                <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs sm:text-sm transition-all duration-300">
                  R$ {currentKit.discountAmount.toFixed(2).replace(".", ",")} de desconto
                </Badge>
              </div>

              {/* Seletor de quantidade */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs sm:text-sm text-gray-700">Quantidade:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 hover:scale-110"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-12 sm:w-16 text-center border-x border-gray-300 py-2 text-sm focus:outline-none focus:bg-gray-50 transition-colors"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 hover:scale-110"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Seção de cálculo de frete com busca de CEP */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Calcular frete e prazo de entrega
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DAFBD] focus:border-transparent transition-all"
                      />
                      {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                    </div>
                    <Button
                      onClick={() => fetchAddressFromCep(cep)}
                      disabled={loadingCep || cep.replace(/\D/g, "").length !== 8}
                      className="bg-[#5DAFBD] hover:bg-[#4A9DAB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loadingCep ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Exibe o endereço encontrado */}
                {address && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start gap-2 sm:gap-3 mb-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">{address.logradouro}</p>
                        <p className="text-xs text-gray-600">
                          {address.bairro}, {address.localidade} - {address.uf}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações de entrega via Correios */}
                <div className="flex items-center justify-between gap-3 bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Image
                      src="/correios-logo.png"
                      alt="Correios"
                      width={40}
                      height={40}
                      className="rounded flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Entrega via Correios ©</p>
                      <p className="text-xs text-gray-600">
                        {address ? (
                          <>
                            para{" "}
                            <span className="text-green-600 font-medium">
                              {address.localidade} - {address.uf}
                            </span>
                          </>
                        ) : (
                          "Informe seu CEP para calcular"
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold text-xs sm:text-sm whitespace-nowrap">
                    Frete Grátis
                  </span>
                </div>
              </div>

              {/* Garantias e políticas */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-green-600">Devolução grátis.</span>
                    <span className="text-gray-600"> Até 7 dias a partir do recebimento.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-green-600">Compra Garantida.</span>
                    <span className="text-gray-600"> Ou seu dinheiro de volta</span>
                  </div>
                </div>
              </div>

              {/* Botão principal de compra */}
              <Button
                ref={buyButtonRef}
                onClick={handleBuyNow}
                className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-base sm:text-lg py-5 sm:py-6 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                Comprar agora
              </Button>
            </div>
          </div>
        </div>

        {/* ========================================
            SEÇÃO DE DESCRIÇÃO DO PRODUTO
            ======================================== */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">
            GlicoMax - Controle Sua Glicose Sem Dor e Com Precisão
          </h2>

          <div className="space-y-6 sm:space-y-8">
            {/* Seção: O Futuro do Monitoramento */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-black mb-3 sm:mb-4">
                O Futuro do Monitoramento da Glicose Chegou!
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                <span className="font-semibold">Cansado de furar os dedos todos os dias?</span> Com o{" "}
                <span className="font-semibold text-[#5DAFBD]">GlicoMax</span>, você monitora seus níveis de glicose de
                forma rápida, indolor e precisa. Graças à tecnologia a laser de última geração, agora é possível
                acompanhar sua saúde sem complicações.
              </p>
            </div>

            {/* Seção: Por que escolher o GlicoMax */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-black mb-4">Por que escolher o GlicoMax?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Droplet className="w-5 h-5 text-[#5DAFBD] flex-shrink-0 mt-0.5" />
                  <div className="text-sm sm:text-base text-gray-600">
                    <span className="font-semibold">Sem agulhas, sem dor:</span> Tecnologia revolucionária que elimina a
                    necessidade de lancetas e fitas de teste.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-[#5DAFBD] flex-shrink-0 mt-0.5" />
                  <div className="text-sm sm:text-base text-gray-600">
                    <span className="font-semibold">Resultados instantâneos:</span> Medidas em segundos, direto na tela
                    do dispositivo.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#5DAFBD] flex-shrink-0 mt-0.5" />
                  <div className="text-sm sm:text-base text-gray-600">
                    <span className="font-semibold">100% Seguro e Confiável:</span> Aprovado por especialistas e
                    rigorosamente testado.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ThumbsUp className="w-5 h-5 text-[#5DAFBD] flex-shrink-0 mt-0.5" />
                  <div className="text-sm sm:text-base text-gray-600">
                    <span className="font-semibold">Fácil de usar:</span> Design intuitivo para todas as idades.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-[#5DAFBD] flex-shrink-0 mt-0.5" />
                  <div className="text-sm sm:text-base text-gray-600">
                    <span className="font-semibold">Conexão com seu smartphone:</span> Acompanhe seu histórico de
                    medições no aplicativo dedicado.
                  </div>
                </li>
              </ul>
            </div>

            {/* Seção: Quem deve usar */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-black mb-4">Quem deve usar o GlicoMax?</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#5DAFBD] flex-shrink-0 mt-1" />
                  <p className="text-sm sm:text-base text-gray-600">Pessoas com diabetes tipo 1 e tipo 2.</p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#5DAFBD] flex-shrink-0 mt-1" />
                  <p className="text-sm sm:text-base text-gray-600">
                    Quem quer evitar desconforto em medições diárias.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#5DAFBD] flex-shrink-0 mt-1" />
                  <p className="text-sm sm:text-base text-gray-600">
                    Qualquer pessoa que deseja monitorar a saúde de forma moderna e eficiente.
                  </p>
                </li>
              </ul>
            </div>

            {/* Seção: Como Funciona */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-black mb-4">Como Funciona?</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#5DAFBD] text-white font-semibold text-sm flex-shrink-0">
                    1
                  </span>
                  <p className="text-sm sm:text-base text-gray-600 pt-0.5">Posicione o dispositivo no dedo.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#5DAFBD] text-white font-semibold text-sm flex-shrink-0">
                    2
                  </span>
                  <p className="text-sm sm:text-base text-gray-600 pt-0.5">Pressione o botão para iniciar a leitura.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#5DAFBD] text-white font-semibold text-sm flex-shrink-0">
                    3
                  </span>
                  <p className="text-sm sm:text-base text-gray-600 pt-0.5">Veja os resultados na tela.</p>
                </li>
              </ol>
            </div>

            {/* Seção: Depoimentos */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-black mb-4">Depoimentos de Quem Já Usa</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm sm:text-base text-gray-600 italic mb-2">
                    "O GlicoMax mudou minha rotina! Agora não preciso mais sofrer com picadas. Muito mais prático e
                    rápido."
                  </p>
                  <p className="text-sm text-gray-500">Ana Luiza, 42 anos.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm sm:text-base text-gray-600 italic mb-2">
                    "Tecnologia que realmente faz diferença. Fácil de usar e extremamente confiável."
                  </p>
                  <p className="text-sm text-gray-500">Carlos Eduardo, 38 anos.</p>
                </div>
              </div>
            </div>

            {/* Seção: Promoção */}
            <div className="bg-gradient-to-r from-[#5DAFBD]/10 to-green-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-black mb-3">
                Promoção Exclusiva por Tempo Limitado!
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Garanta o seu <span className="font-semibold text-[#5DAFBD]">GlicoMax</span> hoje mesmo e receba{" "}
                <span className="font-semibold text-green-600">frete grátis</span> para todo o Brasil. Aproveite a
                oferta especial e monitore sua glicose com praticidade e precisão.
              </p>
            </div>

            {/* Seção: FAQ */}
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-black mb-4">Perguntas Frequentes (FAQ)</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <HelpCircle className="w-5 h-5 text-[#5DAFBD] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#5DAFBD] text-sm sm:text-base mb-2">O GlicoMax é confiável?</h4>
                    <p className="text-sm sm:text-base text-gray-600">
                      Sim! O dispositivo foi rigorosamente testado e aprovado por instituições renomadas na área de
                      saúde.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <HelpCircle className="w-5 h-5 text-[#5DAFBD] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#5DAFBD] text-sm sm:text-base mb-2">
                      Preciso conectar ao celular para usar?
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600">
                      Não. O GlicoMax funciona de forma independente.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <HelpCircle className="w-5 h-5 text-[#5DAFBD] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#5DAFBD] text-sm sm:text-base mb-2">
                      Como é feita a limpeza do aparelho?
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600">
                      Basta passar um pano macio e álcool 70% na superfície.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#5DAFBD] text-sm sm:text-base mb-2">Não perca tempo!</h4>
                    <p className="text-sm sm:text-base text-gray-600">
                      Revolucione a forma de cuidar da sua saúde com o{" "}
                      <span className="font-semibold text-[#5DAFBD]">GlicoMax</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            SEÇÃO DE AVALIAÇÕES
            ======================================== */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          {/* Cabeçalho das avaliações com média e botão */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                {/* Exibe a média de avaliação */}
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800">
                  {averageRating.toFixed(1)}
                </span>
                {/* Exibe as estrelas com preenchimento parcial para 4.8 */}
                <div className="flex gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => {
                    const fillPercentage = Math.min(Math.max(averageRating - i, 0), 1) * 100
                    return (
                      <div key={i} className="relative w-4 h-4 sm:w-5 sm:h-5">
                        {/* Estrela de fundo (cinza) */}
                        <svg className="absolute inset-0 text-gray-300 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {/* Estrela de frente (amarela) com preenchimento parcial */}
                        <svg
                          className="absolute inset-0 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                          style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )
                  })}
                </div>
              </div>
              <span className="text-sm sm:text-base text-gray-600">1427+ Avaliações</span>
            </div>

            {/* Botão para escrever comentário */}
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto">
              Escreva um comentário
            </Button>
          </div>

          {/* Filtros de avaliações */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 pb-6 border-b">
            <p className="text-xs sm:text-sm text-gray-600">Mostrando 1 - 12 de 1427+ Comentários</p>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* Filtro por número de estrelas */}
              <div className="relative flex-1 sm:flex-none min-w-[120px]">
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 sm:pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5DAFBD] cursor-pointer transition-all duration-200 hover:border-gray-400"
                >
                  <option>Todos</option>
                  <option>5 estrelas</option>
                  <option>4 estrelas</option>
                  <option>3 estrelas</option>
                  <option>2 estrelas</option>
                  <option>1 estrela</option>
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Filtro de ordenação */}
              <div className="relative flex-1 sm:flex-none min-w-[120px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 sm:pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5DAFBD] cursor-pointer transition-all duration-200 hover:border-gray-400"
                >
                  <option>Últimas</option>
                  <option>Mais antigas</option>
                  <option>Mais úteis</option>
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Grid de avaliações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
            {reviews.slice(0, reviewsToShow).map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-300 hover:border-gray-300"
              >
                {/* Cabeçalho do card com avatar e nome */}
                <div className="flex items-start gap-2 mb-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image src={review.avatar || "/placeholder.svg"} alt={review.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>

                {/* Estrelas da avaliação */}
                <div className="flex gap-0.5 mb-2 sm:mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Comentário da avaliação */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Botão "Carregar mais" */}
          {reviewsToShow < totalReviews && (
            <div className="flex justify-center">
              <Button
                onClick={() => setReviewsToShow(reviewsToShow + 10)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 sm:px-8 py-2 text-sm sm:text-base rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Carregue mais
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* ========================================
          FOOTER / RODAPÉ
          ======================================== */}
      <footer className="bg-black text-white">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
          {/* Seção: Central de Atendimento (accordion) */}
          <div className="border-b border-gray-700">
            <button
              onClick={() => setFooterSectionOpen((prev) => ({ ...prev, atendimento: !prev.atendimento }))}
              className="w-full flex items-center justify-between py-4 text-left hover:text-gray-300 transition-colors"
            >
              <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wide">CENTRAL DE ATENDIMENTO</h3>
              {footerSectionOpen.atendimento ? (
                <Minus className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Plus className="w-5 h-5 flex-shrink-0" />
              )}
            </button>

            {footerSectionOpen.atendimento && (
              <div className="pb-6 space-y-3 text-sm">
                <p>
                  <span className="font-semibold">Horário de atendimento:</span> Seg a sex, das 08hs às 17h.
                </p>
                <p>
                  <span className="font-semibold">Contato:</span>{" "}
                  <a href="tel:+5521995869198" className="text-blue-400 hover:underline">
                    (21) 99586-9198
                  </a>
                </p>
                <p>
                  <span className="font-semibold">E-mail:</span>{" "}
                  <a href="mailto:sac@rdigitalexpress.com.br" className="hover:text-gray-300">
                    sac@rdigitalexpress.com.br
                  </a>
                </p>
                <p>
                  <span className="font-semibold">CNPJ:</span> 21.643.638/0001-10
                </p>
                <p>
                  <span className="font-semibold">Endereço:</span> Avenida Manoel Duarte, 15995, Parque Lafaiete, CEP:
                  25015-331 Duque de Caxias - RJ
                </p>
              </div>
            )}
          </div>

          {/* Seção: Políticas (accordion) */}
          <div className="border-b border-gray-700">
            <button
              onClick={() => setFooterSectionOpen((prev) => ({ ...prev, politicas: !prev.politicas }))}
              className="w-full flex items-center justify-between py-4 text-left hover:text-gray-300 transition-colors"
            >
              <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wide">POLÍTICAS</h3>
              {footerSectionOpen.politicas ? (
                <Minus className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Plus className="w-5 h-5 flex-shrink-0" />
              )}
            </button>

            {footerSectionOpen.politicas && (
              <div className="pb-6">
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-gray-300 transition-colors">
                      Aviso Legal
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-300 transition-colors">
                      Termos de Uso
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-300 transition-colors">
                      Políticas de Envio e Frete
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-300 transition-colors">
                      Políticas de Devolução e Reembolso
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-300 transition-colors">
                      Políticas de Privacidade
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Copyright */}
          <div className="py-6 space-y-2 text-xs sm:text-sm text-gray-400">
            <p>© Compra Segura</p>
            <p>CNPJ: 21.643.638/0001-10. Todos Os Direitos Reservados © 2015.</p>
          </div>
        </div>
      </footer>

      {/* ========================================
          BOTÃO DE COMPRA FIXO (STICKY)
          Aparece quando o usuário rola a página para baixo
          ======================================== */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 transition-all duration-500 ${
          showStickyButton ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Informações do produto */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                <Image src={currentKit.image || "/placeholder.svg"} alt="GlicoMax" fill className="object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Kit {selectedKit} Unidade{selectedKit > 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg sm:text-2xl font-bold text-green-500">
                    R$ {currentKit.price.toFixed(2).replace(".", ",")}
                  </span>
                  <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs">-{currentKit.discount}%</Badge>
                </div>
              </div>
            </div>

            {/* Seletor de quantidade - oculto no mobile */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-600">Qtd:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm font-medium min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Botão de compra */}
            <Button
              onClick={handleBuyNow}
              className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Comprar agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
