package com.aichat.pptunnel;

import android.content.Context;
import android.content.res.AssetManager;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;

import com.peergine.tunnel.android.pgJniTunnel;

import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Created by royin on 2018/1/30.
 */

public class PPTunUtil {

    public static int startTunnel(Context context, String localDevID) {
        String sCfgPath = copyCfgFile(context);

        String sSysInfo = "(DevID){" + localDevID
                + "}(MacAddr){" + getMacAddr(context) + "}(CpuMHz){0}"
                + "(MemSize){0}(BrwVer){}(OSVer){}(OSSpk){}(OSType){Android}";
        int iErr = 0;
        try {
            iErr = pgJniTunnel.Start(sCfgPath, sSysInfo);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return iErr;
    }

    public static void stopTunnel() {
        pgJniTunnel.Stop();
    }

    public static int addConnect(String remoteListenAddr, String localListenAddr, String remoteDevID) {
        pgJniTunnel.OutClientAddr resClientAddr = new pgJniTunnel.OutClientAddr();
        int iErr = pgJniTunnel.ConnectAdd("", remoteDevID, 0,
                0, remoteListenAddr, localListenAddr, resClientAddr);
        return iErr;
    }

    public static int deleteConnect(String remoteListenAddr, String localListenAddr, String remoteDevID) {
        int iErr = pgJniTunnel.ConnectDelete("", remoteDevID, 0,
                0, remoteListenAddr, localListenAddr);
        return iErr;
    }

    public static String getMacAddr(Context context){
        String macAddress = "";

        try {
            WifiManager wm = (WifiManager)context.getSystemService(Context.WIFI_SERVICE);
            if (wm != null) {
                WifiInfo info = wm.getConnectionInfo();
                if (info != null) {
                    macAddress = info.getMacAddress();
                    macAddress = macAddress.replace(":", "").toUpperCase();
                }
                else {
                    macAddress = genMacAddr();
                }
            }
            else {
                macAddress = genMacAddr();
            }
        }
        catch (Exception ex) {
            macAddress = genMacAddr();
        }

        return macAddress;
    }

    public static String genMacAddr() {
        try {
            java.util.Random rand = new java.util.Random();
            byte[] byMac = new byte[6];
            rand.nextBytes(byMac);
            return String.format("%02X%02X%02X%02X%02X%02X",
                    byMac[0], byMac[1], byMac[2], byMac[3], byMac[4], byMac[5]);
        }
        catch (Exception ex) {
            return "";
        }
    }

    // Get configure file's path.
    public static String copyCfgFile(Context context) {

        String sFilePath = "";
        String sDataPath = context.getFilesDir().getAbsolutePath();
        AssetManager assetMng = context.getAssets();
        try {
            InputStream in = assetMng.open("demoTunnel.cfg");
            OutputStream out = new FileOutputStream(sDataPath + "/demoTunnel.cfg");

            byte[] buffer = new byte[4096];
            int iRead = in.read(buffer);
            while (iRead != -1) {
                out.write(buffer ,0, iRead);
                iRead = in.read(buffer);
            }
            in.close();
            out.flush();
            out.close();
            sFilePath = sDataPath + "/demoTunnel.cfg";
        } catch(Exception e) {
            e.printStackTrace();
        }

        return sFilePath;
    }


}
