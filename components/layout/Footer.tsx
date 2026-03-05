import Link from "next/link";
import { PawPrint, Heart } from "lucide-react";

export const Footer = () => (
  <footer className="bg-yellow-100 text-white-400 mt-auto font-fredoka">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500
              flex items-center justify-center">
              <PawPrint size={16} className="text-blue" strokeWidth={2.5} />
            </div>
            <span className="text-black text-lg font-bold">MyPetJoy</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-500 font-medium">
            Connecting loving homes with pets that need them. Shop, adopt, and care for your furry friends.
          </p>
        </div>

        {[
          { title:"Explore", links:[
            { href:"/pets",    label:"Adopt a Pet" },
            { href:"/products",    label:"Pet Shop"    },
            { href:"/quiz",    label:"AI Quiz"     },
          ]},
          { title:"Account", links:[
            { href:"/login",    label:"Sign In"    },
            { href:"/register", label:"Register"   },
            { href:"/profile",  label:"My Profile" },
            { href:"/orders",   label:"My Orders"  },
          ]},
          { title:"Support", links:[
            { href:"#", label:"FAQ"            },
            { href:"#", label:"Contact Us"     },
            { href:"#", label:"Privacy Policy" },
            { href:"#", label:"Terms of Service" },
          ]},
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-blue font-semibold mb-4 text-md uppercase tracking-wider">{col.title}</h4>
            <ul className="space-y-2.5">
  {col.links.map((l, i) => (
    <li key={`${l.href}-${i}`}>
      <Link href={l.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors font-normal">
        {l.label}
      </Link>
    </li>
  ))}
</ul>
          </div>
        ))}
      </div>
    </div>
  </footer>
);