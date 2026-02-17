import { Link, Route, Routes } from "react-router-dom";
import { IoMdSettings } from "react-icons/io";
import { IoPeople } from "react-icons/io5";
import { PiFarmDuotone } from "react-icons/pi";
import { GiFarmer } from "react-icons/gi";

export default function AdminPage() {
    return(
        <div className="w-full h-screen flex">
            <div className="w-[300px] h-full flex flex-col items-center  ">
                <span className="text-3xl font-bold my-5"> Admin Panel</span>
                <Link className="flex flex-row h-[60px] w-full items-center p-[20px] border text-xl gap-[5px] " to="/admin/harvest"> <PiFarmDuotone /> Harvest</Link>
                <Link className="flex flex-row h-[60px] w-full items-center p-[20px] border text-xl gap-[5px]" to="/admin/farmers"> <GiFarmer /> Farmers</Link>
                <Link className="flex flex-row h-[60px] w-full items-center p-[20px] border text-xl gap-[5px]" to="/admin/users"> <IoPeople /> users</Link>
                <Link className="flex flex-row h-[60px] w-full items-center p-[20px] border text-xl gap-[5px]" to="/admin/settings"> <IoMdSettings /> settings</Link>
            </div>
            <div className="w-[calc(100%-300px)]  h-full ">
                <Routes path="/">
                    <Route path="/" element={<h1>Dashboard</h1>}/>
                    <Route path="/farmers" element={<h1>Farmers</h1>}/>
                </Routes>
            </div>

        </div>
    )
}